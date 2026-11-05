# Native job ownership precedes the first instruction of every supervised root.
if (-not ('BmadNativeProcess' -as [type])) {
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Text;
using System.Diagnostics;
using System.Collections;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.Win32.SafeHandles;
public sealed class BmadCapture {
  readonly MemoryStream output = new MemoryStream();
  public volatile bool Overflow;
  public Task Task;
  public byte[] Bytes { get { lock(output) return output.ToArray(); } }
  public BmadCapture(Stream stream, BmadNativeProcess child, int limit) {
    Task = System.Threading.Tasks.Task.Run(() => {
      try {
        byte[] block = new byte[8192];
        while(true) {
          int n=stream.Read(block,0,block.Length);
          if(n==0) break;
          lock(output) {
            if(output.Length+n>limit) { Overflow=true; child.Stop(); break; }
            output.Write(block,0,n);
          }
        }
      } catch(ObjectDisposedException) {} catch(IOException) {}
    });
  }
}
public sealed class BmadNativeProcess : IDisposable {
  [StructLayout(LayoutKind.Sequential)] struct SA { public int length; public IntPtr descriptor; [MarshalAs(UnmanagedType.Bool)] public bool inherit; }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct SI {
    public int cb; public string reserved,desktop,title; public int x,y,xsize,ysize,xchars,ychars,fill,flags; public short show,reserved2; public IntPtr reservedPtr,input,output,error;
  }
  [StructLayout(LayoutKind.Sequential)] struct PI { public IntPtr process,thread; public int pid,tid; }
  [StructLayout(LayoutKind.Sequential)] struct BASIC { public long processTime,jobTime; public uint flags; public UIntPtr minWorking,maxWorking; public uint activeLimit; public UIntPtr affinity; public uint priority,scheduling; }
  [StructLayout(LayoutKind.Sequential)] struct IOCOUNT { public ulong a,b,c,d,e,f; }
  [StructLayout(LayoutKind.Sequential)] struct EXTENDED { public BASIC basic; public IOCOUNT io; public UIntPtr processMemory,jobMemory,peakProcess,peakJob; }
  [StructLayout(LayoutKind.Sequential)] struct ACCOUNT { public long a,b,c,d; public uint faults,total,active,terminated; }
  [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr sa,string name);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job,int type,ref EXTENDED info,int size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr job,int type,out ACCOUNT info,int size,IntPtr returned);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr job,IntPtr process);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool TerminateJobObject(IntPtr job,uint code);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool CreatePipe(out IntPtr read,out IntPtr write,ref SA sa,int size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(IntPtr handle,uint mask,uint flags);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateFile(string name,uint access,uint share,ref SA sa,uint disposition,uint flags,IntPtr template);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcess(string app,StringBuilder args,IntPtr pa,IntPtr ta,bool inherit,uint flags,IntPtr env,string cwd,ref SI startup,out PI pi);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool TerminateProcess(IntPtr process,uint code);
  [DllImport("kernel32.dll")] static extern uint WaitForSingleObject(IntPtr handle,uint ms);
  [DllImport("kernel32.dll")] static extern bool GetExitCodeProcess(IntPtr process,out uint code);
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  IntPtr job,process;
  public int Id;
  public Stream Stdout,Stderr;
  public bool AssignedBeforeResume;
  static void Require(bool ok) { if(!ok) throw new Win32Exception(Marshal.GetLastWin32Error()); }
  static string Quote(string arg) {
    if(arg.Length>0 && arg.IndexOfAny(new char[]{' ','\t','\n','\v','"'})<0) return arg;
    var b=new StringBuilder("\""); int slashes=0;
    foreach(char ch in arg) {
      if(ch=='\\') { slashes++; continue; }
      if(ch=='"') { b.Append('\\',slashes*2+1); b.Append(ch); }
      else { b.Append('\\',slashes); b.Append(ch); }
      slashes=0;
    }
    b.Append('\\',slashes*2); return b.Append('"').ToString();
  }
  public static BmadNativeProcess Start(ProcessStartInfo start) {
    var owned=new BmadNativeProcess();
    IntPtr outRead=IntPtr.Zero,outWrite=IntPtr.Zero,errRead=IntPtr.Zero,errWrite=IntPtr.Zero,input=IntPtr.Zero,env=IntPtr.Zero,thread=IntPtr.Zero;
    try {
      owned.job=CreateJobObject(IntPtr.Zero,null); Require(owned.job!=IntPtr.Zero);
      var limits=new EXTENDED(); limits.basic.flags=0x2000; // KILL_ON_JOB_CLOSE; no breakaway permission
      Require(SetInformationJobObject(owned.job,9,ref limits,Marshal.SizeOf<EXTENDED>()));
      var sa=new SA{length=Marshal.SizeOf<SA>(),inherit=true};
      Require(CreatePipe(out outRead,out outWrite,ref sa,0)); Require(SetHandleInformation(outRead,1,0));
      Require(CreatePipe(out errRead,out errWrite,ref sa,0)); Require(SetHandleInformation(errRead,1,0));
      input=CreateFile("NUL",0x80000000,3,ref sa,3,0,IntPtr.Zero); Require(input!=new IntPtr(-1));
      var args=new StringBuilder(Quote(start.FileName));
      foreach(var arg in start.ArgumentList) args.Append(' ').Append(Quote(arg));
      var variables=new SortedList(StringComparer.OrdinalIgnoreCase);
      foreach(var pair in start.Environment) variables.Add(pair.Key,pair.Value);
      var environment=new StringBuilder();
      foreach(DictionaryEntry pair in variables) environment.Append(pair.Key).Append('=').Append(pair.Value).Append('\0');
      environment.Append('\0'); env=Marshal.StringToHGlobalUni(environment.ToString());
      var si=new SI{cb=Marshal.SizeOf<SI>(),flags=0x100,input=input,output=outWrite,error=errWrite};
      PI pi;
      Require(CreateProcess(start.FileName,args,IntPtr.Zero,IntPtr.Zero,true,0x08000404,env,string.IsNullOrEmpty(start.WorkingDirectory)?null:start.WorkingDirectory,ref si,out pi)); // suspended + unicode + no window
      owned.process=pi.process;thread=pi.thread;owned.Id=pi.pid;
      Require(AssignProcessToJobObject(owned.job,owned.process)); owned.AssignedBeforeResume=true;
      owned.Stdout=new FileStream(new SafeFileHandle(outRead,true),FileAccess.Read);outRead=IntPtr.Zero;
      owned.Stderr=new FileStream(new SafeFileHandle(errRead,true),FileAccess.Read);errRead=IntPtr.Zero;
      Require(ResumeThread(thread)!=0xffffffff);
      return owned;
    } catch (Exception failure) {
      failure.Data["MadnessRootCreated"]=(owned.process!=IntPtr.Zero);
      if(owned.process!=IntPtr.Zero) { TerminateProcess(owned.process,1); WaitForSingleObject(owned.process,2000); }
      owned.Dispose(); throw;
    } finally {
      foreach(var h in new[]{outRead,outWrite,errRead,errWrite,input,thread}) if(h!=IntPtr.Zero && h!=new IntPtr(-1)) CloseHandle(h);
      if(env!=IntPtr.Zero) Marshal.FreeHGlobal(env);
    }
  }
  public bool Wait(int ms) { return WaitForSingleObject(process,(uint)ms)==0; }
  public bool HasExited { get { return Wait(0); } }
  public int ExitCode { get { uint value; Require(GetExitCodeProcess(process,out value));return unchecked((int)value); } }
  public int Active { get { ACCOUNT value;Require(QueryInformationJobObject(job,1,out value,Marshal.SizeOf<ACCOUNT>(),IntPtr.Zero));return (int)value.active; } }
  public void Stop() { if(job!=IntPtr.Zero) TerminateJobObject(job,1); }
  public void Dispose() {
    if(job!=IntPtr.Zero) { TerminateJobObject(job,1);CloseHandle(job);job=IntPtr.Zero; }
    if(Stdout!=null) Stdout.Dispose(); if(Stderr!=null) Stderr.Dispose();
    if(process!=IntPtr.Zero) {CloseHandle(process);process=IntPtr.Zero;}
  }
}
"@
}
function Assert-BmadDestination([string]$Path,[string]$Owner) {
  $full=[IO.Path]::GetFullPath($Path);$base=[IO.Path]::GetFullPath($Owner)
  if(-not $full.StartsWith($base+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'WRITE_SCOPE'}
  Assert-BmadChain $base
  $cursor=$full
  while(-not (Test-Path -LiteralPath $cursor)){ $cursor=[IO.Path]::GetDirectoryName($cursor);if(-not $cursor){throw 'WRITE_PARENT'} }
  Assert-BmadChain $cursor
}
function Remove-BmadOwnedTree([string]$Target,[string]$Owner) {
  $Target=[IO.Path]::GetFullPath($Target); $Owner=[IO.Path]::GetFullPath($Owner)
  if (-not $Target.StartsWith($Owner+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'CLEANUP_SCOPE' }
  Assert-BmadChain $Owner
  if (-not (Test-Path -LiteralPath $Target)) { return }
  Assert-BmadChain ([IO.Path]::GetDirectoryName($Target))
  $item=Get-Item -LiteralPath $Target -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { $item.Delete(); return }
  if ($item.PSIsContainer) {
    foreach($child in Get-ChildItem -LiteralPath $Target -Force) { Remove-BmadOwnedTree $child.FullName $Owner }
    Assert-BmadChain $Target
    [IO.Directory]::Delete($Target,$false)
  } else { [IO.File]::Delete($Target) }
}
function Write-BmadState([string]$Path,$Value) {
  $parent=[IO.Path]::GetDirectoryName($Path)
  Assert-BmadChain $parent
  $temp=$Path+'.next'
  foreach($target in @($Path,$temp)){Assert-BmadDestination $target $parent}
  [IO.File]::WriteAllText($temp,($Value|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  Assert-BmadChain $parent
  [IO.File]::Move($temp,$Path,$true)
}
function Invoke-BmadSupervised($Start,[int]$TimeoutMs,[string]$StatePath,[string[]]$OwnedPaths,[string]$Owner,[string]$OutLog,[string]$ErrLog,[string]$Marker='',[ref]$StateObservation,[string]$CancelPath='') {
  $state=[ordered]@{schema=5;outcome='running';exit=$null;started=$false;owned=@($OwnedPaths);cleanup=@();results_present=$false;job_assigned_before_resume=$false}
  if($null -ne $StateObservation){$StateObservation.Value=$state}
  $process=$null;$outCapture=$null;$errCapture=$null
  $clock=[Diagnostics.Stopwatch]::StartNew()
  try {
    foreach($path in @($StatePath,$OutLog,$ErrLog)+$OwnedPaths){Assert-BmadDestination $path $Owner}
    Write-BmadState $StatePath $state
    $nativeClock=[Diagnostics.Stopwatch]::StartNew();$process=[BmadNativeProcess]::Start($Start);$state.native_start_ms=$nativeClock.ElapsedMilliseconds;$state.native_start_utc=[DateTime]::UtcNow.ToString('O')
    $state.started=$true;$state.pid=$process.Id;$state.job_assigned_before_resume=$process.AssignedBeforeResume
    Write-BmadState $StatePath $state
    $outCapture=[BmadCapture]::new($process.Stdout,$process,4194304)
    $errCapture=[BmadCapture]::new($process.Stderr,$process,4194304)
    if($Marker) {
      $handshake=[Diagnostics.Stopwatch]::StartNew()
      while(-not (Test-Path -LiteralPath $Marker) -and -not $process.HasExited -and $handshake.ElapsedMilliseconds -lt 30000){if($process.HasExited){[Threading.Thread]::Sleep(10)}else{[void]$process.Wait(25)}}
      $state.marker_observed=Test-Path -LiteralPath $Marker;$state.handshake_ms=$handshake.ElapsedMilliseconds
      if(-not $state.marker_observed){throw 'CHILD_MARKER_NOT_OBSERVED'}
      Write-BmadState $StatePath $state
    }
    $waitClock=[Diagnostics.Stopwatch]::StartNew()
    while(((-not $process.HasExited) -or $process.Active -gt 0) -and $waitClock.ElapsedMilliseconds -lt $TimeoutMs -and -not ($CancelPath -and (Test-Path -LiteralPath $CancelPath))){if($process.HasExited){[Threading.Thread]::Sleep(10)}else{[void]$process.Wait(25)}}
    if($CancelPath -and (Test-Path -LiteralPath $CancelPath)){$state.outcome='cancelled'}
    elseif(-not $process.HasExited){$state.outcome='timeout'}else{$state.outcome='completed';$state.exit=$process.ExitCode}
  } catch {
    $failure=$_.Exception
    while($null -ne $failure){if($failure.Data.Contains('MadnessRootCreated') -and $failure.Data['MadnessRootCreated']){$state.started=$true;$state.start_observation='root-created-before-failure'};$failure=$failure.InnerException}
    $state.outcome=if($state.started){'supervision-error'}else{'start-failed'};$state.error=$_.Exception.Message
  } finally {
    if($null -ne $process) {
      try {
        $state.root_exited_before_stop=$process.HasExited;$state.root_exit_before_stop=$(if($state.root_exited_before_stop){$process.ExitCode}else{$null});$state.before_stop_utc=[DateTime]::UtcNow.ToString('O');$state.active_before_stop=$process.Active
        if($state.outcome -eq 'completed' -and $state.active_before_stop -gt 0){$state.outcome='descendants-stopped'}
        $process.Stop()
        $stop=[Diagnostics.Stopwatch]::StartNew()
        while($process.Active -gt 0 -and $stop.ElapsedMilliseconds -lt 5000){[Threading.Thread]::Sleep(10)}
        $state.job_active_after_stop=$process.Active;$state.stop_ms=$stop.ElapsedMilliseconds
        if($state.job_active_after_stop -ne 0){$state.outcome='stop-failed'}
        if($null -eq $state.exit -and $process.Wait(1000)){$state.exit=$process.ExitCode}
      }catch{$state.outcome='stop-failed';$state.stop_error=$_.Exception.Message}
    }
    # Drain both pipes concurrently; never await EOF without a finite deadline.
    $drain=[Diagnostics.Stopwatch]::StartNew()
    foreach($pair in @(@($outCapture,$OutLog),@($errCapture,$ErrLog))) {
      try {
        $bytes=[byte[]]@()
        if($null -ne $pair[0]) {
          $remaining=[Math]::Max(0,3000-[int]$drain.ElapsedMilliseconds)
          if(-not $pair[0].Task.Wait($remaining)){$state.outcome='drain-timeout'}
          $bytes=$pair[0].Bytes
          if($pair[0].Overflow){$state.outcome='output-limit'}
        }
        Assert-BmadDestination $pair[1] $Owner
        [IO.File]::WriteAllBytes($pair[1],$bytes)
      }catch{$state.outcome='capture-failed';$state.capture_error=$_.Exception.Message}
    }
    $state.drain_ms=$drain.ElapsedMilliseconds
    if($null -ne $process){$process.Dispose()}
    foreach($target in $OwnedPaths) {
      try{Remove-BmadOwnedTree $target $Owner;$state.cleanup+=@{path=$target;removed=(-not(Test-Path -LiteralPath $target))}}
      catch{$state.cleanup+=@{path=$target;removed=$false;error=$_.Exception.Message}}
    }
    $state.results_present=Test-Path -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($StatePath)) 'results.json')
    if($state.cleanup.Where({-not $_.removed}).Count){$state.outcome='cleanup-failed'}
    $state.elapsed_ms=$clock.ElapsedMilliseconds
    Assert-BmadDestination $StatePath $Owner
    Write-BmadState $StatePath $state
  }
  return $state
}