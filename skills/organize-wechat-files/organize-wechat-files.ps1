param(
    [string]$source_path = "",
    [string]$target_path = "",
    [string]$operation = "move",
    [bool]$skip_existing = $true,
    [bool]$mark_empty = $true,
    [bool]$generate_log = $true
)

$ErrorActionPreference = "Continue"

$w1 = "工作相关"
$o1 = "其它"
$r1 = "券商研报和行业报告"
$b1 = "白皮书"
$e1 = "电子书"
$w2 = "微信其它文件"

$keywords = @("元创", "先风", "广集", "小蜂", "得瑞", "麦斯塔", "海容", "存风", "容风", "安风", "苹起", "苹一", "苹二", "shinefore", "印芯", "莱特", "融卡", "光子瑞利")
$reportKw = @("证券", "行业报告", "研报", "行业", "研究")
$whitepaperKw = @("白皮书", "whitepaper")

$fileTypes = @{
    Word = @(".doc", ".docx", ".docm", ".rtf")
    Excel = @(".xls", ".xlsx", ".csv", ".xlsb")
    PDF = @(".pdf")
    PPT = @(".ppt", ".pptx")
    Audio = @(".mp3", ".m4a", ".wav")
    Video = @(".mp4", ".wmv", ".avi")
    Image = @(".png", ".gif", ".jpg", ".jpeg", ".webp", ".avif")
    Archive = @(".zip", ".rar", ".7z", ".tar", ".gz")
    Doc = @(".txt", ".html", ".py", ".xmind", ".pages", ".numbers", ".epub", ".caj")
}

function Get-Cat {
    param($file, $type)
    $name = $file.Name
    if ($type -eq "Word") {
        foreach ($kw in $keywords) { if ($name -match $kw) { return @{C=$w1; S=$kw} } }
        return @{C=$o1; S=""}
    }
    if ($type -eq "Excel") {
        foreach ($kw in $keywords) { if ($name -match $kw) { return @{C=$w1; S=""} } }
        return @{C=$o1; S=""}
    }
    if ($type -eq "PDF") {
        foreach ($kw in $keywords) { if ($name -match $kw) { return @{C=$w1; S=$kw} } }
        foreach ($kw in $reportKw) { if ($name -match $kw) { return @{C=$r1; S=""} } }
        foreach ($kw in $whitepaperKw) { if ($name -match $kw) { return @{C=$b1; S=""} } }
        return @{C=$o1; S=""}
    }
    return @{C=$o1; S=""}
}

function New-DirStruct {
    param($base, $yrs)
    foreach ($yr in $yrs) {
        $dirs = @(
            "$base\$yr\Word\$w1","$base\$yr\Word\$o1","$base\$yr\Excel",
            "$base\$yr\PDF\$r1","$base\$yr\PDF\$b1","$base\$yr\PDF\$e1","$base\$yr\PDF\$w1","$base\$yr\PDF\$o1",
            "$base\$yr\PPT","$base\$yr\$o1\音频","$base\$yr\$o1\视频","$base\$yr\$o1\图片","$base\$yr\$o1\压缩包","$base\$yr\$o1\文档"
        )
        foreach ($kw in $keywords) { $dirs += "$base\$yr\Word\$w1\$kw"; $dirs += "$base\$yr\PDF\$w1\$kw" }
        $wodirs = @("$base\$w2\$yr\音频","$base\$w2\$yr\视频","$base\$w2\$yr\图片","$base\$w2\$yr\压缩包","$base\$w2\$yr\文档")
        foreach ($d in $dirs + $wodirs) { if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null } }
    }
    if (!(Test-Path "$base\$w2")) { New-Item -ItemType Directory -Path "$base\$w2" -Force | Out-Null }
}

function Move-Files {
    param($src, $dst)
    $c = @{Word=0;Excel=0;PDF=0;PPT=0;Audio=0;Video=0;Image=0;Archive=0;Doc=0;Other=0}
    $log = @()
    $yrDirs = Get-ChildItem -Path $src -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d{4}-\d{2}$' }
    foreach ($d in $yrDirs) {
        $yr = $d.Name.Substring(0,4)
        $files = Get-ChildItem -Path $d.FullName -File -ErrorAction SilentlyContinue
        foreach ($f in $files) {
            $ext = $f.Extension.ToLower()
            $fname = $f.Name
            $ddir = ""
            try {
                if ($fileTypes.Word -contains $ext) {
                    $r = Get-Cat $f "Word"
                    $ddir = if ($r.C -eq $w1 -and $r.S) { "$dst\$yr\Word\$($r.C)\$($r.S)" } else { "$dst\$yr\Word\$($r.C)" }
                    $c.Word++
                } elseif ($fileTypes.Excel -contains $ext) {
                    $r = Get-Cat $f "Excel"
                    $ddir = if ($r.C -eq $w1) { "$dst\$yr\Excel\$($r.C)" } else { "$dst\$yr\Excel" }
                    $c.Excel++
                } elseif ($fileTypes.PDF -contains $ext) {
                    $r = Get-Cat $f "PDF"
                    $ddir = if ($r.C -eq $w1 -and $r.S) { "$dst\$yr\PDF\$($r.C)\$($r.S)" } elseif ($r.C -eq $r1 -or $r.C -eq $b1) { "$dst\$yr\PDF\$($r.C)" } else { "$dst\$yr\PDF\$($r.C)" }
                    $c.PDF++
                } elseif ($fileTypes.PPT -contains $ext) { $ddir = "$dst\$yr\PPT"; $c.PPT++
                } elseif ($fileTypes.Audio -contains $ext) { $ddir = "$dst\$w2\$yr\音频"; $c.Audio++
                } elseif ($fileTypes.Video -contains $ext) { $ddir = "$dst\$w2\$yr\视频"; $c.Video++
                } elseif ($fileTypes.Image -contains $ext) { $ddir = "$dst\$w2\$yr\图片"; $c.Image++
                } elseif ($fileTypes.Archive -contains $ext) { $ddir = "$dst\$w2\$yr\压缩包"; $c.Archive++
                } elseif ($fileTypes.Doc -contains $ext) { $ddir = "$dst\$w2\$yr\文档"; $c.Doc++
                } else { $c.Other++; continue }
                if ($ddir) {
                    if (!(Test-Path $ddir)) { New-Item -ItemType Directory -Path $ddir -Force | Out-Null }
                    $tf = Join-Path $ddir $fname
                    if ($skip_existing -and (Test-Path $tf)) { $log += "[SKIP] $fname" }
                    else {
                        if ($operation -eq "move") { Move-Item -Path $f.FullName -Destination $ddir -Force; $log += "[MOVE] $fname" }
                        else { Copy-Item -Path $f.FullName -Destination $ddir -Force; $log += "[COPY] $fname" }
                    }
                }
            } catch { $log += "[ERROR] $fname : $($_.Exception.Message)" }
        }
    }
    if ($mark_empty) {
        $yrDirs = Get-ChildItem -Path $src -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d{4}-\d{2}$' }
        foreach ($d in $yrDirs) {
            if ((Get-ChildItem -Path $d.FullName -File -ErrorAction SilentlyContinue).Count -eq 0) {
                try { Rename-Item -Path $d.FullName -NewName "$($d.Name)_empty" -ErrorAction Stop; $log += "[MARK] $($d.Name)" } catch { }
            }
        }
    }
    if ($generate_log) { $log | Out-File -FilePath "$dst\move_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt" -Encoding UTF8 }
    Write-Host ""
    Write-Host "=== Summary ==="
    Write-Host "Word:$($c.Word) Excel:$($c.Excel) PDF:$($c.PDF) PPT:$($c.PPT)"
    Write-Host "Audio:$($c.Audio) Video:$($c.Video) Image:$($c.Image) Archive:$($c.Archive) Doc:$($c.Doc) Other:$($c.Other)"
    Write-Host "Total: $($c.Word+$c.Excel+$c.PDF+$c.PPT+$c.Audio+$c.Video+$c.Image+$c.Archive+$c.Doc+$c.Other)"
    if ($generate_log) { Write-Host "Log saved" }
}

if ($source_path -eq "" -or $target_path -eq "") { Write-Host "Usage: .\-source_path <src> -target_path <dst>"; exit 1 }
if (!(Test-Path $source_path)) { Write-Host "Source not found: $source_path"; exit 1 }
Write-Host "Starting..."; Write-Host "Source: $source_path"; Write-Host "Target: $target_path"; Write-Host "Op: $operation"
$years = @("2016","2017","2018","2019","2020","2021","2022","2023","2024","2025","2026","2027","2028","2029","2030")
New-DirStruct -base $target_path -yrs $years
Move-Files -src $source_path -dst $target_path
Write-Host ""; Write-Host "Done!"