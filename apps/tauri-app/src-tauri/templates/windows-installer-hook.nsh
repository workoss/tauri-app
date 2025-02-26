; 在复制文件、设置注册表项值和创建快捷方式之前运行
!macro NSIS_HOOK_PREINSTALL

!macroend

; 安装程序完成复制所有文件、设置注册表项和创建快捷方式后运行
!macro NSIS_HOOK_POSTINSTALL

  ; Get the current user's %HOMEDRIVE% and %HOMEPATH%
  ReadEnvStr $0 "HOMEDRIVE"
  ReadEnvStr $1 "HOMEPATH"
  StrCpy $1 "$0$1\.workoss\bin"

  ; Add the %HOMEPATH%\.nvmd\bin folder to the system PATH
  ExecWait '$INSTDIR\resources\path.exe add "$1"' ; put the path in quotes because of possible spaces

end:
!macroend


; 在删除任何文件、注册表项和快捷方式之前运行
!macro NSIS_HOOK_PREUNINSTALL

  ; Get the current user's %HOMEDRIVE% and %HOMEPATH%
  ReadEnvStr $0 "HOMEDRIVE"
  ReadEnvStr $1 "HOMEPATH"
  StrCpy $1 "$0$1\.nvmd\bin"

  ; Remove the %HOMEPATH%\.workoss\bin folder from the system PATH
  ExecWait '$INSTDIR\resources\path.exe remove "$1"'

  done:
!macroend

; 文件、注册表项和快捷方式被删除后运行。
!macro NSIS_HOOK_POSTUNINSTALL
  
!macroend