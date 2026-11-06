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
  static List<Held> HoldChain(string p,bool lockDirectories=false,bool lockLeaf=false) {
    var held=new List<Held>();
    try {
      string current=p.Substring(0,3);held.Add(new Held(current,lockDirectories));
      foreach(string part in p.Substring(3).Split(new char[]{'\\'},StringSplitOptions.RemoveEmptyEntries)) {current=Path.Combine(current,part);held.Add(new Held(current,lockDirectories&&(lockLeaf||current!=p)));}
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

  const uint MirrorRead=1, MirrorWrite=2, MirrorAttributes=0x80, MirrorDelete=0x10000, MirrorSynchronize=0x100000;
  const uint ShareRead=1, ShareWrite=2, ShareAll=7, FileOpen=1, FileCreate=2;
  const int NameMissing=unchecked((int)0xc0000034);

  [StructLayout(LayoutKind.Sequential)] struct NativeName {
    public ushort length,capacity;
    public IntPtr text;
  }
  [StructLayout(LayoutKind.Sequential)] struct NativeObject {
    public int size;
    public IntPtr parent,name;
    public uint attributes;
    public IntPtr security,quality;
  }
  [StructLayout(LayoutKind.Sequential)] struct NativeIo {
    public IntPtr status,information;
  }
  [DllImport("ntdll.dll")] static extern int NtCreateFile(out IntPtr handle,uint access,ref NativeObject target,
    out NativeIo io,IntPtr allocation,uint attributes,uint share,uint disposition,uint options,IntPtr ea,uint eaSize);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetFileInformationByHandle(
    SafeFileHandle handle,int informationClass,ref byte value,uint size);

  static int RelativeMirrorOpen(SafeFileHandle parent,string name,uint access,uint share,uint disposition,uint type,out SafeFileHandle handle) {
    IntPtr text=Marshal.StringToHGlobalUni(name), nativeName=IntPtr.Zero;
    bool held=false;
    handle=null;
    try {
      nativeName=Marshal.AllocHGlobal(Marshal.SizeOf<NativeName>());
      Marshal.StructureToPtr(new NativeName {
        text=text,length=(ushort)(name.Length*2),capacity=(ushort)((name.Length+1)*2)
      },nativeName,false);
      parent.DangerousAddRef(ref held);
      var target=new NativeObject {
        size=Marshal.SizeOf<NativeObject>(),parent=parent.DangerousGetHandle(),name=nativeName,attributes=0x40 // OBJ_CASE_INSENSITIVE
      };
      // A single validated component, synchronous I/O, and no reparse traversal.
      int status=NtCreateFile(out var raw,access|MirrorAttributes|MirrorSynchronize,ref target,out var io,IntPtr.Zero,
        0x80,share,disposition,type|0x00200020,IntPtr.Zero,0);
      if(status>=0) {
        handle=new SafeFileHandle(raw,true);
        if(disposition==FileCreate&&io.information!=new IntPtr(2)) {
          handle.Dispose();
          throw Refuse("GRAPH_MIRROR_NOT_CREATED");
        }
      }
      return status;
    } finally {
      if(held)parent.DangerousRelease();
      Marshal.FreeHGlobal(nativeName);
      Marshal.FreeHGlobal(text);
    }
  }
  static SafeFileHandle OpenMirrorEntry(SafeFileHandle parent,string name,uint access,uint share,uint disposition=FileOpen,uint type=0) {
    int status=RelativeMirrorOpen(parent,name,access,share,disposition,type,out var handle);
    if(status<0)throw Refuse("GRAPH_MIRROR_OPEN: "+unchecked((uint)status).ToString("X8"));
    return handle;
  }
  static ulong MirrorIndex(Info info) { return ((ulong)info.indexHigh<<32)|info.indexLow; }
  static ulong MirrorCreationTicks(Info info) {
    return ((ulong)(uint)info.creation.dwHighDateTime<<32)|(uint)info.creation.dwLowDateTime;
  }
  static bool SameMirrorIdentity(Info a,Info b) {
    return a.volume==b.volume&&MirrorIndex(a)==MirrorIndex(b)&&MirrorCreationTicks(a)==MirrorCreationTicks(b)&&
      (a.attributes&16)==(b.attributes&16);
  }
  static void CheckMirrorName(string name) {
    if(name.Length==0||name.Length>255||name.EndsWith(".",StringComparison.Ordinal)||name.EndsWith(" ",StringComparison.Ordinal))
      throw Refuse("GRAPH_MIRROR_NAME");
    foreach(char c in name)
      if(c<32||"<>:\"/\\|?*".IndexOf(c)>=0)throw Refuse("GRAPH_MIRROR_NAME");
    string stem=name.Split('.')[0].TrimEnd(' ').ToUpperInvariant();
    if(stem=="CON"||stem=="PRN"||stem=="AUX"||stem=="NUL"||stem=="CONIN$"||stem=="CONOUT$"||
      (stem.Length==4&&(stem.StartsWith("COM",StringComparison.Ordinal)||stem.StartsWith("LPT",StringComparison.Ordinal))&&
        "123456789\u00B9\u00B2\u00B3".IndexOf(stem[3])>=0))throw Refuse("GRAPH_MIRROR_NAME");
  }
  sealed class MirrorSource {
    public string[] parts;
    public int offset,length;
  }
  static List<MirrorSource> MirrorSources(byte[] payload) {
    if(payload==null||payload.Length<12||payload.Length>50*1024*1024||Encoding.ASCII.GetString(payload,0,8)!="MADMSRC1")
      throw Refuse("GRAPH_MIRROR_FRAME");
    uint count=System.Buffers.Binary.BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(8,4));
    if(count==0||count>1024)throw Refuse("GRAPH_MIRROR_FRAME");
    var result=new List<MirrorSource>();
    var prefixes=new Dictionary<string,(string name,bool directory)>(StringComparer.OrdinalIgnoreCase);
    var utf8=new UTF8Encoding(false,true);
    int offset=12,total=0;
    for(uint i=0;i<count;i++) {
      if(payload.Length-offset<8)throw Refuse("GRAPH_MIRROR_FRAME");
      uint pathSize=System.Buffers.Binary.BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(offset,4));
      uint dataSize=System.Buffers.Binary.BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(offset+4,4));
      offset+=8;
      if(pathSize==0||pathSize>32*1024||dataSize>1024*1024||
        (long)pathSize+dataSize>payload.Length-offset||total+dataSize>16*1024*1024)throw Refuse("GRAPH_MIRROR_FRAME");
      string relative;
      try { relative=utf8.GetString(payload,offset,(int)pathSize); }
      catch(DecoderFallbackException) { throw Refuse("GRAPH_MIRROR_FRAME"); }
      var parts=relative.Split('/');
      if(parts.Length>25)throw Refuse("GRAPH_MIRROR_NAME"); // Same depth bound as the captured inventory.
      string prefix="";
      for(int n=0;n<parts.Length;n++) {
        CheckMirrorName(parts[n]);
        prefix+=parts[n];
        bool directory=n<parts.Length-1;
        if(prefixes.TryGetValue(prefix,out var existing)) {
          if(!directory||!existing.directory||prefix!=existing.name)throw Refuse("GRAPH_MIRROR_NAME");
        } else prefixes.Add(prefix,(prefix,directory));
        prefix+="/";
      }
      offset+=(int)pathSize;
      result.Add(new MirrorSource {parts=parts,offset=offset,length=(int)dataSize});
      offset+=(int)dataSize;
      total+=(int)dataSize;
    }
    if(offset!=payload.Length)throw Refuse("GRAPH_MIRROR_FRAME");
    return result;
  }

  sealed class MirrorEntry {
    public readonly MirrorEntry parent;
    public readonly string name;
    public readonly bool directory;
    public SafeFileHandle handle;
    public Info created;
    public MirrorEntry(MirrorEntry parent,string name,bool directory,SafeFileHandle handle) {
      this.parent=parent;
      this.name=name;
      this.directory=directory;
      this.handle=handle;
    }
    public Info Check(SafeFileHandle current) {
      var info=Read(current);
      if(!SameMirrorIdentity(created,info)||directory!=((info.attributes&16)!=0))throw Refuse("GRAPH_MIRROR_CHANGED");
      return info;
    }
  }
  public sealed class MirrorRemoval {
    public long RemovedBytes { get; internal set; }
    public int RemovedFiles { get; internal set; }
    public bool Complete { get; internal set; }
  }
  public sealed class OwnedMirror : IDisposable {
    readonly List<Held> ancestors;
    readonly List<MirrorEntry> entries=new List<MirrorEntry>();
    readonly MirrorEntry root;
    bool materialized,disposed;
    public string Path { get; }

    internal OwnedMirror(string taskFolder,uint volume,ulong index,ulong creationTicks) {
      taskFolder=Lexical(taskFolder);
      Path=System.IO.Path.Combine(taskFolder,"mirror");
      ancestors=HoldChain(taskFolder,true,true);
      try {
        CheckAncestors();
        var task=Read(ancestors[ancestors.Count-1].handle);
        if(task.volume!=volume||MirrorIndex(task)!=index||MirrorCreationTicks(task)!=creationTicks)
          throw Refuse("GRAPH_MIRROR_TASK_CHANGED");
        root=Create(null,"mirror",true);
      } catch { Dispose();throw; }
    }
    void CheckAncestors() {
      foreach(var ancestor in ancestors) {
        if((ancestor.before.attributes&16)==0)throw Refuse("GRAPH_MIRROR_PARENT");
        ancestor.Check(false);
      }
    }
    SafeFileHandle Parent(MirrorEntry entry) {
      return entry.parent==null?ancestors[ancestors.Count-1].handle:entry.parent.handle;
    }
    MirrorEntry Create(MirrorEntry parent,string name,bool directory) {
      var container=parent==null?ancestors[ancestors.Count-1].handle:parent.handle;
      if(parent!=null)parent.Check(container);
      var handle=OpenMirrorEntry(container,name,directory?MirrorRead:MirrorWrite,
        directory?ShareRead|ShareWrite:ShareRead,FileCreate,directory?1u:0x40u);
      var entry=new MirrorEntry(parent,name,directory,handle);
      entries.Add(entry); // Enrol only FILE_CREATE results, including partial materialization.
      entry.created=Read(handle);
      entry.Check(handle);
      return entry;
    }
    void Write(MirrorEntry entry,ReadOnlySpan<byte> bytes) {
      RandomAccess.Write(entry.handle,bytes,0);
      // Bridge from the writer to an ordinary-reader-compatible pin with no rename window.
      SwitchToReadPin(entry,ShareRead|ShareWrite);
      var info=SwitchToReadPin(entry,ShareRead);
      if(info.sizeHigh!=0||info.sizeLow!=bytes.Length)throw Refuse("GRAPH_MIRROR_CHANGED");
      // Reject in-place writes during the brief share-write handoff.
      var actual=new byte[bytes.Length];
      int offset=0;
      while(offset<actual.Length) {
        int count=RandomAccess.Read(entry.handle,actual.AsSpan(offset),offset);
        if(count==0)throw Refuse("GRAPH_MIRROR_CHANGED");
        offset+=count;
      }
      if(!bytes.SequenceEqual(actual))throw Refuse("GRAPH_MIRROR_CHANGED");
    }
    Info SwitchToReadPin(MirrorEntry entry,uint share) {
      var reader=OpenMirrorEntry(Parent(entry),entry.name,MirrorRead,share);
      Info info;
      try { info=entry.Check(reader); }
      catch { reader.Dispose();throw; }
      entry.handle.Dispose();
      entry.handle=reader;
      return info;
    }
    public void Materialize(byte[] payload) {
      if(disposed||materialized)throw Refuse("GRAPH_MIRROR_STATE");
      materialized=true;
      var sources=MirrorSources(payload);
      CheckAncestors();
      var directories=new Dictionary<string,MirrorEntry>(StringComparer.Ordinal);
      foreach(var source in sources) {
        var parent=root;
        string prefix="";
        for(int n=0;n<source.parts.Length-1;n++) {
          string part=source.parts[n];
          prefix+=part+"/";
          if(!directories.TryGetValue(prefix,out var next)) {
            next=Create(parent,part,true);
            directories.Add(prefix,next);
          }
          parent=next;
        }
        Write(Create(parent,source.parts[source.parts.Length-1],false),payload.AsSpan(source.offset,source.length));
      }
      CheckAncestors();
      foreach(var entry in entries)entry.Check(entry.handle);
    }
    bool Remove(MirrorEntry entry,Info? before,MirrorRemoval result) {
      CheckAncestors();
      for(var p=entry.parent;p!=null;p=p.parent)p.Check(p.handle);
      entry.Check(entry.handle);
      var parent=Parent(entry);
      // Keep the original object alive while releasing the pin that denies delete sharing.
      // A replacement may appear at this name during the handoff. Compare both handles
      // before setting disposition, then use only the verified deletion handle.
      using(var anchor=OpenMirrorEntry(parent,entry.name,0,ShareAll)) {
        entry.Check(anchor);
        entry.handle.Dispose();
        using(var deletion=OpenMirrorEntry(parent,entry.name,MirrorRead|MirrorDelete,ShareRead)) {
          var info=entry.Check(deletion);
          entry.Check(anchor);
          if(before.HasValue&&!Same(before.Value,info))return false;
          byte delete=1;
          if(!SetFileInformationByHandle(deletion,4,ref delete,1))return false; // FileDispositionInfo
        }
      }
      if(!Absent(parent,entry.name))return false;
      if(before.HasValue) {
        var info=before.Value;
        result.RemovedFiles++;
        result.RemovedBytes+=(long)(((ulong)info.sizeHigh<<32)|info.sizeLow);
      }
      return true;
    }
    static bool Absent(SafeFileHandle parent,string name) {
      int status=RelativeMirrorOpen(parent,name,0,ShareAll,FileOpen,0,out var existing);
      existing?.Dispose();
      return status==NameMissing;
    }
    public MirrorRemoval RemoveOwned() {
      if(disposed)throw Refuse("GRAPH_MIRROR_STATE");
      const int budgetMs=10000;
      var elapsed=System.Diagnostics.Stopwatch.StartNew();
      var result=new MirrorRemoval {Complete=true};
      try {
        // Measure the validated file handles before the first disposition.
        var before=new Info?[entries.Count];
        for(int i=0;i<entries.Count;i++) {
          if(elapsed.ElapsedMilliseconds>=budgetMs) { result.Complete=false;return result; }
          var entry=entries[i];
          if(entry.directory)continue;
          try { before[i]=entry.Check(entry.handle); }
          catch(IOException) { result.Complete=false; }
        }
        for(int i=entries.Count-1;i>=0;i--) {
          if(elapsed.ElapsedMilliseconds>=budgetMs) { result.Complete=false;return result; }
          var entry=entries[i];
          if(!entry.directory&&!before[i].HasValue)continue;
          try { if(!Remove(entry,before[i],result))result.Complete=false; }
          catch(IOException) { result.Complete=false; }
        }
        return result;
      } finally { Dispose(); }
    }
    public void Dispose() {
      if(disposed)return;
      disposed=true;
      for(int i=entries.Count-1;i>=0;i--)entries[i].handle.Dispose();
      for(int i=ancestors.Count-1;i>=0;i--)ancestors[i].Dispose();
    }
  }
  public static OwnedMirror CreateMirror(string taskFolder,uint volume,ulong index,ulong creationTicks) { return new OwnedMirror(taskFolder,volume,index,creationTicks); }

  public sealed class GraphTaskAllocation {
    public uint Volume { get; }
    public ulong Index { get; }
    public ulong CreationTicks { get; }

    internal GraphTaskAllocation(uint volume,ulong index,ulong creationTicks) {
      Volume=volume;
      Index=index;
      CreationTicks=creationTicks;
    }
  }
  public static GraphTaskAllocation AllocateGraphTask(string taskFolder) {
    string path=Lexical(taskFolder);
    string name=Path.GetFileName(path);
    if(!name.StartsWith("graph-",StringComparison.Ordinal)||!Guid.TryParseExact(name.Substring(6),"D",out var id)||
      name!="graph-"+id.ToString("D"))throw Refuse("GRAPH_TASK_NAME");
    var chain=HoldChain(Path.GetDirectoryName(path),true,true);
    try {
      foreach(var ancestor in chain) {
        if((ancestor.before.attributes&16)==0)throw Refuse("GRAPH_TASK_PARENT");
        ancestor.Check(false);
      }
      var parent=chain[chain.Count-1];
      using(var created=OpenMirrorEntry(parent.handle,name,MirrorRead,ShareRead|ShareWrite,FileCreate,1)) {
        var info=Read(created);
        if((info.attributes&16)==0||info.volume!=parent.before.volume)throw Refuse("GRAPH_TASK_IDENTITY");
        return new GraphTaskAllocation(info.volume,MirrorIndex(info),MirrorCreationTicks(info));
      }
    } finally {
      for(int i=chain.Count-1;i>=0;i--)chain[i].Dispose();
    }
  }
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
