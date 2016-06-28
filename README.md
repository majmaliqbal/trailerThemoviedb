# Readme

An API which take ViaPlay movie url as input and return the trailer of that movie using TMDb API as required. 

The solution is quite simple.. just do the following steps..

## Note
   please provide your api key at config.json file

## install
   
   npm install

## Run
   
   npm start

just query the api through http://localhost:(port which you set in config.json)/api/trailer?movieUrl=http://content.viaplay.se/pc-se/film/fight-club-1999

The return result will be {"trailerUrl":"https://www.youtube.com/watch?v=S3AVcCggRnU"}

## Testing

    $ npm run eslint
    $ npm test

I just try to solve some of the unit tests as the time of 2 hours was the constraint.
   

## Scalable
   
   One consideration in particular is how your API handles heavy load (tens of thousands of requests per second)

   I use Redis, plus cache data in variable, so to achieve this… I were running out of time so did not implement Cluster or child_process

For Stress test, I use siege which i installed at mac and then run different commands such as 

siege -c50 -t1M  "http://localhost:3000/api/trailer?movieUrl=http://content.viaplay.se/pc-se/film/fight-club-1999"

siege -b -t1M  "http://localhost:3000/api/trailer?movieUrl=http://content.viaplay.se/pc-se/film/fight-club-1999"
