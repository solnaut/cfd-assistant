param(
    [ValidateSet('home', 'fluent-meshing', 'fluent-guide', 'calculators', 'formulas')]
    [string]$Target = 'home',
    [switch]$Stop,
    [switch]$Preview
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$project = Split-Path -Parent $PSScriptRoot
$ports = 5173, 5174
$routeMap = @{
    'home'           = '/'
    'fluent-meshing' = '/fluent-meshing'
    'calculators'    = '/calculators'
    'formulas'       = '/formulas'
    'fluent-guide'   = '/fluent-guide'
}

function Test-Workbench([int]$Port) {
    try {
        $uri = "http://127.0.0.1:$Port/"
        $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200) -and $response.Content.Contains('<title>CFD Assistant</title>')
    } catch {
        return $false
    }
}

function Stop-ProjectServers {
    $connections = @(Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) {
        Write-Host 'No CFD Assistant workbench server is currently listening on ports 5173 or 5174.'
        return
    }

    $stopped = 0
    $stoppedPids = New-Object System.Collections.Generic.HashSet[int]
    $projectLower = $project.ToLowerInvariant()
    foreach ($conn in $connections) {
        $pidValue = [int]$conn.OwningProcess
        if ($stoppedPids.Contains($pidValue)) { continue }
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pidValue" -ErrorAction SilentlyContinue
        if (!$proc) { continue }
        $cmd = if ($proc.CommandLine) { $proc.CommandLine.ToLowerInvariant() } else { '' }
        $isNodeVite = ($proc.Name -like 'node*') -and $cmd.Contains('vite')
        $isThisProject = $cmd.Contains($projectLower) -or (Test-Workbench ([int]$conn.LocalPort))
        if ($isNodeVite -and $isThisProject) {
            Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
            [void]$stoppedPids.Add($pidValue)
            $stopped++
            Write-Host "Stopped CFD Assistant server (PID $pidValue)."
        }
    }

    if ($stopped -eq 0) {
        Write-Host 'Ports 5173/5174 are occupied by other processes; nothing from CFD Assistant was stopped.'
    }
}

if ($Stop) {
    Stop-ProjectServers
    exit 0
}

$targetPath = $routeMap[$Target]

foreach ($port in $ports) {
    if (Test-Workbench $port) {
        Start-Process "http://127.0.0.1:$port$targetPath"
        exit 0
    }
}

$vitePath = Join-Path $project 'node_modules\vite\bin\vite.js'
if (!(Test-Path -LiteralPath $vitePath)) {
    Write-Host 'Project dependencies are missing. Installing via npm.cmd install...'
    Push-Location $project
    try {
        & npm.cmd install
        if ($LASTEXITCODE -ne 0) {
            throw "npm.cmd install failed with exit code $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

$node = (Get-Command node.exe).Source
$occupied = @(Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue)
$occupiedPorts = @($occupied | ForEach-Object { $_.LocalPort })
$port = $ports | Where-Object { $_ -notin $occupiedPorts } | Select-Object -First 1
if (!$port) {
    throw 'Ports 5173 and 5174 are in use by other services.'
}

$distIndex = Join-Path $project 'dist\index.html'
$viteArgs = if ($Preview -and (Test-Path -LiteralPath $distIndex)) {
    @($vitePath, 'preview', '--host', '127.0.0.1', '--port', $port, '--strictPort')
} else {
    @($vitePath, '--host', '127.0.0.1', '--port', $port, '--strictPort')
}

$launch = @{
    FilePath         = $node
    WorkingDirectory = $project
    WindowStyle      = 'Hidden'
    PassThru         = $true
    ArgumentList     = $viteArgs
}
$server = Start-Process @launch

Write-Host 'Starting the CFD Assistant workbench...'
$deadline = [DateTime]::UtcNow.AddSeconds(20)
while (!$server.HasExited -and [DateTime]::UtcNow -lt $deadline) {
    if (Test-Workbench $port) {
        Start-Process "http://127.0.0.1:$port$targetPath"
        exit 0
    }
    Start-Sleep -Milliseconds 300
}

throw 'The workbench did not start. Run npm.cmd run dev in the project folder to see the server error.'
