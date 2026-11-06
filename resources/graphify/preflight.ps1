# Trusted pinned code only. The cached type is constant code, never an admission.
$ErrorActionPreference = 'Stop'
if (-not ('GraphClosedRuntime' -as [type])) {
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32.SafeHandles;
public static class GraphClosedRuntime {
  [StructLayout(LayoutKind.Sequential)] struct Info {
    public uint attributes; public System.Runtime.InteropServices.ComTypes.FILETIME creation,access,write;
    public uint volume,sizeHigh,sizeLow,links,indexHigh,indexLow;
  }
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern SafeFileHandle CreateFileW(string p,uint access,uint share,IntPtr security,uint mode,uint flags,IntPtr template);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetFileInformationByHandle(SafeFileHandle h,out Info info);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint GetFileType(SafeFileHandle h);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint GetFinalPathNameByHandleW(SafeFileHandle h,StringBuilder p,uint size,uint flags);
  [DllImport("kernel32.dll")] static extern IntPtr GetStdHandle(int kind);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(IntPtr h,uint mask,uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetHandleInformation(IntPtr h,out uint flags);
  static Exception Refuse(string code) { return new IOException(code); }
  static string Long(string p) { return p.StartsWith(@"\\?\",StringComparison.Ordinal)?p:@"\\?\"+p; }
  static string Lexical(string p) {
    if(String.IsNullOrEmpty(p)) throw Refuse("RUNTIME_RECORD");
    if(p.StartsWith(@"\\?\",StringComparison.Ordinal)) p=p.Substring(4);
    // Qualified local drive only. Check lexical components BEFORE GetFullPath.
    if(p.Length<3||!Char.IsLetter(p[0])||p[1]!=':'||(p[2]!='\\'&&p[2]!='/')) throw Refuse("RUNTIME_RECORD");
    p=p.Replace('/','\\');
    foreach(string part in p.Substring(3).Split('\\')) if(part=="."||part==".."||part.EndsWith(".",StringComparison.Ordinal)||part.EndsWith(" ",StringComparison.Ordinal)||part.IndexOf(':')>=0||part.IndexOf('\0')>=0) throw Refuse("RUNTIME_RECORD");
    return p.Length>3?p.TrimEnd('\\'):p;
  }
  static Info Read(SafeFileHandle h) {
    Info i;
    if(!GetFileInformationByHandle(h,out i)||GetFileType(h)!=1||i.volume==0||(i.indexHigh==0&&i.indexLow==0)||i.links==0) throw Refuse("RUNTIME_IDENTITY");
    if((i.attributes&0x400)!=0) throw Refuse("RUNTIME_REPARSE");
    if((i.attributes&16)==0&&i.links!=1) throw Refuse("RUNTIME_HARDLINK");
    return i;
  }
  static bool Same(Info a,Info b) {
    return a.volume==b.volume&&a.indexHigh==b.indexHigh&&a.indexLow==b.indexLow&&a.attributes==b.attributes&&a.links==b.links&&a.sizeHigh==b.sizeHigh&&a.sizeLow==b.sizeLow&&a.creation.dwHighDateTime==b.creation.dwHighDateTime&&a.creation.dwLowDateTime==b.creation.dwLowDateTime&&a.write.dwHighDateTime==b.write.dwHighDateTime&&a.write.dwLowDateTime==b.write.dwLowDateTime;
  }
  static SafeFileHandle Open(string p,bool content,out Info i,bool lockDirectory=false) {
    // FILE_LIST_DIRECTORY makes the directory's no-delete sharing effective.
    // Content is read through this exact handle, without write or delete sharing.
    var h=CreateFileW(Long(p),content?0x80000000u:lockDirectory?1u:0u,content?1u:3u,IntPtr.Zero,3,0x02200000,IntPtr.Zero);
    try {
      if(h.IsInvalid) throw Refuse("RUNTIME_READ");
      i=Read(h);
      var name=new StringBuilder(32768);uint n=GetFinalPathNameByHandleW(h,name,(uint)name.Capacity,0);
      if(n==0||n>=name.Capacity||!String.Equals(name.ToString().TrimEnd('\\'),Long(p).TrimEnd('\\'),StringComparison.OrdinalIgnoreCase)) throw Refuse("RUNTIME_IDENTITY");
      return h;
    } catch { h.Dispose();throw; }
  }
  sealed class Held : IDisposable {
    public SafeFileHandle handle;public Info before;string path;
    public Held(string p,bool lockDirectory=false) {path=p;handle=Open(p,false,out before,lockDirectory);}
    public void Check(bool full=true) {var after=Read(handle);if(full?!Same(before,after):before.volume!=after.volume||before.indexHigh!=after.indexHigh||before.indexLow!=after.indexLow||before.attributes!=after.attributes||before.links!=after.links)throw Refuse("RUNTIME_CHANGED: "+path);}
    public void Dispose(){handle.Dispose();}
  }
  static List<Held> HoldChain(string p,bool lockDirectories=false) {
    var held=new List<Held>();
    try {
      string current=p.Substring(0,3);held.Add(new Held(current,lockDirectories));
      foreach(string part in p.Substring(3).Split(new char[]{'\\'},StringSplitOptions.RemoveEmptyEntries)) {current=Path.Combine(current,part);held.Add(new Held(current,lockDirectories&&current!=p));}
      return held;
    } catch {foreach(var h in held)h.Dispose();throw;}
  }
  public static void Chain(string path) {
    string p=Lexical(path);var held=HoldChain(p);
    try {foreach(var h in held)h.Check(false);}finally{foreach(var h in held)h.Dispose();}
  }
  public static void ProtectArtifactOutput() {
    const uint inherit=1;
    var output=GetStdHandle(-11); // STD_OUTPUT_HANDLE
    uint flags;
    if(!SetHandleInformation(output,inherit,0)||!GetHandleInformation(output,out flags)||(flags&inherit)!=0)
      throw Refuse("GRAPH_OUTPUT_HANDLE");
  }
  public static void WriteArtifact(string generation,byte[] bytes) {
    // MADGRPH1 | ASCII generation | uint32 little-endian length | SHA-256 | raw bytes.
    using(var output=new BinaryWriter(Console.OpenStandardOutput())) {
      output.Write(Encoding.ASCII.GetBytes("MADGRPH1"+generation));
      output.Write((uint)bytes.Length);
      output.Write(SHA256.HashData(bytes));
      output.Write(bytes);
    }
  }
  public sealed class HeldArtifact : IDisposable {
    readonly List<Held> held;
    readonly SafeFileHandle file;
    readonly FileStream input;
    readonly Info before;
    readonly byte[] bytes;
    internal HeldArtifact(string source) {
      source=Lexical(source);
      held=HoldChain(source,true);
      try {
        file=Open(source,true,out before);
        if((before.attributes&16)!=0||!Same(held[held.Count-1].before,before))throw Refuse("GRAPH_OUTPUT_CHANGED");
        if(before.sizeHigh!=0||before.sizeLow>16*1024*1024)throw Refuse("GRAPH_OUTPUT_LIMIT");
        input=new FileStream(file,FileAccess.Read);
        bytes=new byte[(int)before.sizeLow];
        input.ReadExactly(bytes);
        if(input.ReadByte()!=-1)throw Refuse("GRAPH_OUTPUT_CHANGED");
        Check();
      }catch{Dispose();throw;}
    }
    void Check() {
      if(!Same(before,Read(file)))throw Refuse("GRAPH_OUTPUT_CHANGED");
      foreach(var entry in held)entry.Check(false);
    }
    public void Publish(string generation) {
      Check();
      WriteArtifact(generation,bytes);
    }
    public void Dispose() {
      try{input?.Dispose();}finally{file?.Dispose();foreach(var entry in held)entry.Dispose();}
    }
  }
  public static HeldArtifact ReadArtifact(string source) { return new HeldArtifact(source); }
  public static void Validate(string root,string[] names,string[] hashes) {
    root=Lexical(root);var ancestors=HoldChain(root);
    try {
      if((ancestors[ancestors.Count-1].before.attributes&16)==0)throw Refuse("RUNTIME_TYPE");
      foreach(string parent in new[]{root,Path.GetDirectoryName(root)}) {
        // GetAttributes distinguishes absent from unreadable; File.Exists would hide faults.
        try {File.GetAttributes(Long(Path.Combine(parent,"pyvenv.cfg")));throw Refuse("RUNTIME_VENV");}
        catch(FileNotFoundException){} catch(DirectoryNotFoundException){}
      }
      if(names==null||hashes==null||names.Length!=hashes.Length||names.Length>4096)throw Refuse("RUNTIME_RECORD");
      var expected=new Dictionary<string,string>(StringComparer.Ordinal);var dirs=new HashSet<string>(StringComparer.Ordinal);
      for(int n=0;n<names.Length;n++) {
        string name=names[n],hash=hashes[n];
        if(String.IsNullOrEmpty(name)||name.StartsWith("/",StringComparison.Ordinal)||name.IndexOf('\\')>=0||name.IndexOf(':')>=0||hash==null||hash.Length!=64)throw Refuse("RUNTIME_RECORD");
        foreach(char c in hash)if(!((c>='0'&&c<='9')||(c>='a'&&c<='f')))throw Refuse("RUNTIME_RECORD");
        foreach(string part in name.Split('/'))if(part.Length==0||part=="."||part==".."||part.EndsWith(".",StringComparison.Ordinal)||part.EndsWith(" ",StringComparison.Ordinal)||part.IndexOf('\0')>=0)throw Refuse("RUNTIME_RECORD");
        if(expected.ContainsKey(name))throw Refuse("RUNTIME_RECORD");expected.Add(name,hash);
        string rel=name;while(rel.Contains("/")){rel=rel.Substring(0,rel.LastIndexOf('/'));dirs.Add(rel);}
      }
      int count=0;var seen=new HashSet<string>(StringComparer.Ordinal);
      Visit(root,root,expected,dirs,seen,ref count);
      if(seen.Count!=expected.Count)throw Refuse("RUNTIME_MISSING");
      foreach(var h in ancestors)h.Check(false);
    }finally{foreach(var h in ancestors)h.Dispose();}
  }
  static void Visit(string root,string folder,Dictionary<string,string> expected,HashSet<string> dirs,HashSet<string> seen,ref int count) {
    using(var directory=new Held(folder)) {
      if((directory.before.attributes&16)==0)throw Refuse("RUNTIME_TYPE");
      foreach(string raw in Directory.GetFileSystemEntries(Long(folder))) {
        string path=raw.StartsWith(@"\\?\",StringComparison.Ordinal)?raw.Substring(4):raw;
        string name=path.Substring(root.Length+1).Replace('\\','/');
        if(++count>4096||name.Split('/').Length>17)throw Refuse("RUNTIME_BOUND");
        using(var entry=new Held(path)) {
          if((entry.before.attributes&16)!=0) {
            if(!dirs.Contains(name))throw Refuse("RUNTIME_EXTRA: "+name);
            Visit(root,path,expected,dirs,seen,ref count);
          } else {
            string hash;if(!expected.TryGetValue(name,out hash))throw Refuse("RUNTIME_EXTRA: "+name);
            Info before;using(var file=Open(path,true,out before)) {
              if((before.attributes&16)!=0||!Same(entry.before,before))throw Refuse("RUNTIME_CHANGED");
              using(var stream=new FileStream(file,FileAccess.Read))using(var sha=SHA256.Create()) {
                string actual=BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
                if(!Same(before,Read(file))||actual!=hash)throw Refuse("RUNTIME_CHANGED: "+name);
              }
            }
            seen.Add(name);
          }
          entry.Check();
        }
      }
      directory.Check();
    }
  }
}
"@
}
function Assert-BmadChain([string]$g2Path) { [GraphClosedRuntime]::Chain($g2Path) }
function Assert-GraphClosedRuntime([string]$g2Root, $g2Files) {
  [string[]]$g2Names=@($g2Files | ForEach-Object { $_.name })
  [string[]]$g2Hashes=@($g2Files | ForEach-Object { $_.sha256 })
  [GraphClosedRuntime]::Validate($g2Root,$g2Names,$g2Hashes)
}
