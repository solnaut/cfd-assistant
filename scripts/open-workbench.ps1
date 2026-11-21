param(
    [ValidateSet('fluent-guide', 'home', 'calculators', 'formulas')]
    [string]$Target = 'fluent-guide',
    [switch]$Stop,
    [switch]$Preview
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$project = Split-Path -Parent $PSScriptRoot
$ports = 5173, 5174
$routeMap = @{
    'home'         = '/'
    'calculators'  = '/calculators'
    'formulas'     = '/formulas'
    'fluent-guide' = '/fluent-guide'
}

function Stop-ProjectServers {
    $connections = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
    if (!$connections) {
        Write-Host 'No CFD Assistant workbench server is currently listening on ports 5173 or 5174.'
        return
    }

    $stopped = 0
    $projectLower = $project.ToLowerInvariant()
    foreach ($pidValue in ($connections.OwningProcess | Select-Object -Unique)) {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pidValue" -ErrorAction SilentlyContinue
        if (!$proc) { continue }
        $cmd = ($proc.CommandLine ?? '').ToLowerInvariant()
        if ($proc.Name -like 'node*' -and $cmd.Contains($projectLower) -and $cmd.Contains('vite')) {
            Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
            $stopped++
            Write-Host "Stopped CFD Assistant server (PID $pidValue)."
        }
    }

    if ($stopped -eq 0) {
        Write-Host 'Ports 5173/5174 are occupied by other processes; nothing from CFD Assistant was stopped.'
    }
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

$vite = 'node_modules/vite/bin/vite.js'
if (!(Test-Path -LiteralPath (Join-Path $project $vite))) {
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
$occupied = Get-NetTCPConnection -State Listen -LocalPort $ports -ErrorAction SilentlyContinue
$port = $ports | Where-Object { $_ -notin $occupied.LocalPort } | Select-Object -First 1
if (!$port) {
    throw 'Ports 5173 and 5174 are in use by other services.'
}

$distIndex = Join-Path $project 'dist/index.html'
$viteArgs = if ($Preview -and (Test-Path -LiteralPath $distIndex)) {
    @($vite, 'preview', '--host', '127.0.0.1', '--port', $port, '--strictPort')
} else {
    @($vite, '--host', '127.0.0.1', '--port', $port, '--strictPort')
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
