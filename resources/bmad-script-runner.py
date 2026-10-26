"""Exécute les scripts BMad épinglés sans cwd, PYTHONPATH ou site-packages.

Les subprocess Python de resolve_personas repassent par ce même lanceur.
Le parent vérifie les octets et limite la liste des scripts/arguments.
"""
import hashlib
import importlib.util
import pathlib
import subprocess
import sys

sys.dont_write_bytecode = True
ROOT = pathlib.Path(sys.argv[1]).resolve()
RUNNER = pathlib.Path(__file__).resolve()
ALLOWED = {
    ROOT / "_bmad/scripts/resolve_customization.py",
    ROOT / "_bmad/scripts/resolve_config.py",
    ROOT / "_bmad/scripts/roster.py",
    ROOT / "_bmad/scripts/memlog.py",
    ROOT / ".agents/skills/bmad-forge-idea/scripts/resolve_personas.py",
}
HASHES = {
    "_bmad/scripts/resolve_config.py": "de612645d546001e1dd3f5af69de6559afe4733bbb54ea40429715e94324a762",
    "_bmad/scripts/resolve_customization.py": "ba379892dea849bdf2bbf7183556dc1030a8aa775ff083d3b89db47b18bf367f",
    "_bmad/scripts/config_utils.py": "989410c4009b908121bbb0fe551a2d7db29f89385d0688cda5cbfc162a5511a1",
    "_bmad/scripts/setup.py": "1de76dce0b4ba702da927d6dc83fd620ec0774aa1c1ab0cc5739167c135f64f8",
    "_bmad/scripts/setup_check.py": "1c59560aba5f3daed3ab64a04bfb15e0f88a2982f63cd541725ac46a4eca033f",
    "_bmad/scripts/knowledge.py": "62ec53ecd5696dfdb919aa6de8321e8605866243129385b8750dab40de55f2cd",
    "_bmad/scripts/roster.py": "a4b82ae7c08312b352cb151e080f7e78d6cf543f65dfdea9f02f60dd3dc0c59d",
    "_bmad/scripts/memlog.py": "097f0a96cf42aa26da70ac15619983fae599eb33a9e5c03060c4684cb32730ed",
    ".agents/skills/bmad-forge-idea/scripts/resolve_personas.py": "8fcd8fc0cf142c8af96c4e5f40c80ac2fe2a6d4b46a9979a1acd35f6b8fdd29c",
}

def trusted_source(path):
    relative = path.relative_to(ROOT).as_posix()
    data = path.read_bytes()
    if relative not in HASHES or hashlib.sha256(data).hexdigest() != HASHES[relative]:
        raise ValueError("empreinte script modifiée")
    return data

SCRIPT = pathlib.Path(sys.argv[2]).resolve()
if SCRIPT not in ALLOWED:
    raise SystemExit("script refusé")
for name in ("config_utils", "setup", "setup_check", "knowledge"):
    spec = importlib.util.spec_from_file_location(name, ROOT / "_bmad/scripts" / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    exec(compile(trusted_source(ROOT / "_bmad/scripts" / (name + ".py")), str(spec.origin), "exec"), module.__dict__)

original_run = subprocess.run

def isolated_run(command, *args, **kwargs):
    if not isinstance(command, list) or len(command) < 2 or command[0] != sys.executable:
        raise ValueError("sous-processus refusé")
    target = pathlib.Path(command[1]).resolve()
    if target not in ALLOWED or target.name == "memlog.py":
        raise ValueError("sous-processus refusé")
    return original_run([sys.executable, "-B", "-I", "-S", str(RUNNER), str(ROOT), str(target), *command[2:]], *args, **kwargs)

subprocess.run = isolated_run
sys.argv = [str(SCRIPT), *sys.argv[3:]]
exec(compile(trusted_source(SCRIPT), str(SCRIPT), "exec"), {"__name__": "__main__", "__file__": str(SCRIPT)})
