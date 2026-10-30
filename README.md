<div align="center">

# ⚔️ Apuntes CPTS — From Zero To Hero

**Mis apuntes personales para la preparación de la _Certified Penetration Tester Specialist_ (HTB CPTS)**

![CPTS](https://img.shields.io/badge/HTB-CPTS-9FEF00?style=for-the-badge&logo=hackthebox&logoColor=black)
![Obsidian](https://img.shields.io/badge/Notas-Obsidian-00E5FF?style=for-the-badge&logo=obsidian&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-En%20progreso-00FF9C?style=for-the-badge)
![Idioma](https://img.shields.io/badge/Idioma-Espa%C3%B1ol-00B8D4?style=for-the-badge)

</div>

---

## 📖 Sobre este repositorio

Este repositorio recoge mis notas de estudio para la certificación **CPTS**, organizadas por módulos del _Penetration Tester Job Role Path_ de Hack The Box.

La idea es que sirva como **guía de consulta rápida** y como diario de aprendizaje: desde los conceptos básicos hasta la explotación de redes empresariales completas. Cada apunte está escrito con mis propias palabras, con comandos probados y la metodología que sigo en la práctica.

> 💡 **Filosofía:** entender el porqué de cada técnica antes de automatizarla. Prefiero la enumeración y la explotación manual para interiorizar lo que hace cada herramienta.

---

## 🗂️ Estructura

Las notas están pensadas para abrirse con **[Obsidian](https://obsidian.md/)**, de modo que los enlaces internos (`[[...]]`) y el grafo de conocimiento funcionen correctamente.

```text
.
├── .obsidian/          # Configuración del vault
└── ⚔️ CPTS/            # Apuntes organizados por módulo
```

### Cómo usarlo

1. Clona el repositorio:
   ```bash
   git clone https://github.com/MrCaste/Apuntes-CPTS_From-Zero-To-Hero.git
   ```
2. Abre Obsidian → **Open folder as vault** → selecciona la carpeta clonada.
3. Navega por la carpeta `⚔️ CPTS` o usa el buscador (`Ctrl + Shift + F`) para encontrar comandos y técnicas.

También puedes leer los archivos `.md` directamente desde GitHub.

---

## 🧭 Contenido (módulos del path)

### 🔰 Fundamentos
- [ ] Network Enumeration with Nmap
- [ ] Footprinting
- [ ] Information Gathering – Web Edition

### 💥 Explotación y post-explotación
- [ ] File Transfers
- [ ] Shells & Payloads
- [ ] Using the Metasploit Framework
- [ ] Password Attacks
- [ ] Attacking Common Services
- [ ] Pivoting, Tunneling & Port Forwarding
- [ ] Active Directory Enumeration & Attacks

### 🌐 Ataques web
- [ ] Attacking Web Applications with Ffuf
- [ ] Login Brute Forcing
- [ ] SQL Injection Fundamentals
- [ ] SQLMap Essentials
- [ ] Cross-Site Scripting (XSS)
- [ ] File Inclusion
- [ ] File Upload Attacks
- [ ] Command Injections
- [ ] Web Attacks
- [ ] Attacking Common Applications

### 🔓 Escalada de privilegios
- [ ] Linux Privilege Escalation
- [ ] Windows Privilege Escalation

### 📝 Cierre (PROXIMAMENTE)
- [ ] Documentation & Reporting
- [ ] Attacking Enterprise Networks

---

## 🛠️ Herramientas habituales

| Categoría | Herramientas |
|-----------|--------------|
| Enumeración | `nmap`, `ffuf`, `gobuster`, `netexec` |
| Web | `Burp Suite`, `sqlmap`, `wfuzz` |
| Contraseñas | `hashcat`, `john`, `hydra` |
| Active Directory | `impacket`, `BloodHound`, `Evil-WinRM` |
| Pivoting | `chisel`, `proxychains`, `ligolo-ng` |

---

## 📚 Recursos recomendados

- [HTB Academy – Penetration Tester Path](https://academy.hackthebox.com/)
- [HackTricks](https://book.hacktricks.xyz/)
- [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings)
- [GTFOBins](https://gtfobins.github.io/) · [LOLBAS](https://lolbas-project.github.io/)
- [RevShells](https://www.revshells.com/)

---

## ⚠️ Aviso legal

Todo el contenido de este repositorio tiene **fines exclusivamente educativos**. Las técnicas aquí descritas deben aplicarse únicamente en **entornos propios, laboratorios o sistemas sobre los que se tenga autorización expresa y por escrito**. No me hago responsable del uso indebido de esta información.

Estos apuntes son notas personales y no reproducen el material íntegro de HTB Academy.

---

## 🤝 Contribuciones

¿Has encontrado un error o quieres aportar algo? Abre un **issue** o un **pull request**, será bienvenido.

---

<div align="center">

**Hecho con 💚 por [MrCaste](https://github.com/MrCaste)**

_"Stay curious, keep hacking (ethically)."_

</div>
