$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$project = Split-Path -Parent $PSScriptRoot
$ports = 5173, 5174

function Test-Workbench([int]$Port) {
    try {
        $uri = "http://127.0.0.1:$Port/src/fluentMock/FluentSolverMock.tsx"
        $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 2
        return $response.Content.Contains('Fluent Solver Workbench')
    } catch {
        return $false
    }
}

foreach ($port in $ports) {
    if (Test-Workbench $port) {
        Start-Process "http://127.0.0.1:$port/fluent-guide"
        exit
    }
}

$vite = 'node_modules/vite/bin/vite.js'
if (!(Test-Path -LiteralPath (Join-Path $project $vite))) {
    throw 'Project dependencies are missing. Run npm.cmd install in the project folder.'
}
$node = (Get-Command node.exe).Source
$occupied = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
$port = $ports | Where-Object { $_ -notin $occupied.LocalPort } | Select-Object -First 1
if (!$port) {
    throw 'Ports 5173 and 5174 are in use by other services.'
}

$launch = @{
    FilePath = $node
    WorkingDirectory = $project
    WindowStyle = 'Hidden'
    PassThru = $true
    ArgumentList = @($vite, '--host', '127.0.0.1', '--port', $port, '--strictPort')
}
$server = Start-Process @launch

Write-Host 'Starting the CFD Assistant workbench...'
$deadline = [DateTime]::UtcNow.AddSeconds(20)
while (!$server.HasExited -and [DateTime]::UtcNow -lt $deadline) {
    if (Test-Workbench $port) {
        Start-Process "http://127.0.0.1:$port/fluent-guide"
        exit
    }
    Start-Sleep -Milliseconds 300
}

throw 'The workbench did not start. Run npm.cmd run dev in the project folder to see the server error.'
