<?php
    require_once('TwitterAPIExchange.php');
    
    $settings = array(
        'oauth_access_token' => "",
        'oauth_access_token_secret' => "",
        'consumer_key' => "",
        'consumer_secret' => ""
    );
    
    $url = "https://api.twitter.com/1.1/statuses/user_timeline.json";

    $requestMethod = "GET";
    $getfield = '?screen_name=dockerstatus&count=1';
    
    $twitter = new TwitterAPIExchange($settings);

    $result =  $twitter->setGetfield($getfield)
             ->buildOauth($url, $requestMethod)
             ->performRequest();    

    $decoded = json_decode($result, true);

    $curl = curl_init("https://api.status.io/1.0/status/533c6539221ae15e3f000031");
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $curl_response = curl_exec($curl);
    curl_close($curl);

    $currentStatus = json_decode($curl_response, true);

    $status = $currentStatus["response"]["status_overall"]["status"];


    $date = date("l d F",  strtotime($decoded[0]["created_at"]));
    $alexa_date = $date;

    $text = preg_replace('/\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i', '', $decoded[0]["text"]);
    
    echo "{\"currentStatus\": \"" . $currentStatus["result"]["status_overall"]["status"] .  "\", \"text\": \"" . $text . "\", \"date\": \"" .  $alexa_date . "\"}";
        
    

?>
