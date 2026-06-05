# 开机一次性任务：启动 sill 项目
$log = "$env:USERPROFILE\Desktop\sill\.boot-task.log"
Write-Output "[$(Get-Date)] 开始执行开机任务" > $log

# 1. 启动服务器
$serverPath = "$env:USERPROFILE\Desktop\sill\site\server.js"
if (Test-Path $serverPath) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        Start-Process -FilePath "node" -ArgumentList $serverPath -WindowStyle Hidden
        Write-Output "[$(Get-Date)] 服务器已启动" >> $log
        Start-Sleep -Seconds 3
    }
}

# 2. 打开浏览器
Start-Process "http://localhost:3000/node-editor.html"
Write-Output "[$(Get-Date)] 浏览器已打开" >> $log

# 3. 播放音乐（打开默认播放器）
$mp3 = "E:\音乐库\我喜欢\長江絕戀_-_Ice_Paper.mp3"
if (Test-Path $mp3) {
    Start-Process $mp3
    Write-Output "[$(Get-Date)] 音乐已播放" >> $log
}

# 4. 删除自身（一次性任务，下次开机不再执行）
$startupBat = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\SillBoot.bat"
if (Test-Path $startupBat) { Remove-Item $startupBat -Force }
Remove-Item $PSCommandPath -Force -ErrorAction SilentlyContinue
Write-Output "[$(Get-Date)] 启动任务已清理，不再重复执行" >> $log
