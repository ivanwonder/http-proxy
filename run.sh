if [ $# == 0 ]
then
  nohup node proxy.js &
elif [ $# == 1 ]
then
  nohup node proxy.js --serverPort $1 &
else
  nohup node proxy.js --serverPort $1 --youtubeProxyPort $2 &
fi

disown
