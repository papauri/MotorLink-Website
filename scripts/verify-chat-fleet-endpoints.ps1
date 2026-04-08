param(
    [string]$BaseUrl = 'http://127.0.0.1:8000/api.php'
)

function Invoke-Endpoint {
    param(
        [string]$Step,
        [string]$Url,
        [string]$Method = 'GET',
        [object]$Payload = $null
    )

    if ($null -ne $Payload) {
        $json = $Payload | ConvertTo-Json -Depth 6
        $response = Invoke-WebRequest -Uri $Url -Method $Method -ContentType 'application/json' -Body $json -UseBasicParsing -SkipHttpErrorCheck
    }
    else {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -SkipHttpErrorCheck
    }

    $body = $response.Content.Trim()
    if ($body.Length -gt 300) {
        $body = $body.Substring(0, 300) + '...'
    }

    [PSCustomObject]@{
        step   = $Step
        status = [int]$response.StatusCode
        body   = $body
    }
}

$results = @()
$results += Invoke-Endpoint -Step 'check_auth' -Url "${BaseUrl}?action=check_auth"
$results += Invoke-Endpoint -Step 'search_message_recipients' -Url "${BaseUrl}?action=search_message_recipients&q=test"
$results += Invoke-Endpoint -Step 'start_conversation' -Url "${BaseUrl}?action=start_conversation" -Method 'POST' -Payload @{ listing_id = 1; seller_id = 2; message = 'Verification ping' }
$results += Invoke-Endpoint -Step 'send_message' -Url "${BaseUrl}?action=send_message" -Method 'POST' -Payload @{ conversation_id = 1; message = 'Verification follow-up' }
$results += Invoke-Endpoint -Step 'get_user_vehicles' -Url "${BaseUrl}?action=get_user_vehicles"
$results += Invoke-Endpoint -Step 'add_user_vehicle' -Url "${BaseUrl}?action=add_user_vehicle" -Method 'POST' -Payload @{ make_id = 1; model_id = 1; year = 2020; transmission = 'automatic'; engine_size_liters = 2.0; fuel_consumption_liters_per_100km = 8.2; fuel_tank_capacity_liters = 55; is_primary = $false }
$results += Invoke-Endpoint -Step 'delete_user_vehicle' -Url "${BaseUrl}?action=delete_user_vehicle&vehicle_id=999999"
$results += Invoke-Endpoint -Step 'set_primary_vehicle' -Url "${BaseUrl}?action=set_primary_vehicle&vehicle_id=999999"

$results | Format-Table -AutoSize
