#! /bin/bash
docker rm -f $(docker ps -a | grep hellojd | awk '{print $1}')
#docker rmi demo/jd_scripts
#docker build -t demo/jd_scripts .
cd /var/local/jd_panel/config
ckArray=($(awk '{print $1}' ck.conf))
cd ../
for(( i=0;i<${#ckArray[@]};i++)) do
	#${#array[@]}获取数组长度用于循环
	#echo 'cks是:'${ckArray[i]}
	mkdir jd_scripts$i
	cp -r  config/*  jd_scripts$i
	cd jd_scripts$i
	kk=${ckArray[i]##*=} #截取最后一个=等号后面的数据
	kk=${kk%;*} #截取;分号之前的数据
	kk=${kk//%/} #替换百分号
	sed -i 's/JD_COOKIE=.*/JD_COOKIE='${ckArray[i]}'/g' docker-compose.yml
	sed -i 's/container_name.*/container_name: hellojd'${kk}'/g' docker-compose.yml
	docker-compose up -d
	cd ../
	rm -rf jd_scripts$i
done;
#npm install
#npm install --save shelljs
#npm install request
#npm install request-promise
#npm install node-schedule

#/usr/local/bin/node  /var/local/jd_panel/panel/server.js
#rm -rf /var/local/jdhelper/other/*
#cp /var/local/jd_panel/config/cronjsfile.sh /var/local/jdhelper/other
#sh /var/local/jdhelper/other/cronjsfile.sh
#rm -f /var/local/jdhelper/other/cronjsfile.sh

#npm install
#npm install --save shelljs
#npm install request
#npm install request-promise
#npm install node-schedule

#/usr/local/bin/node  /var/local/jd_panel/panel/server.js
#nohup /usr/local/bin/node  /var/local/jd_panel/panel/server.js >> /var/local/jdhelper/pannel.log 2>&1 &
#nohup /usr/local/bin/node  /var/local/jd_panel/panel/server.js > out.txt 2>&1  &
#rm -rf /var/local/jdhelper/other/*
#cp /var/local/jd_panel/config/cronjsfile.sh /var/local/jdhelper/other
#sh /var/local/jdhelper/other/cronjsfile.sh
#rm -f /var/local/jdhelper/other/cronjsfile.sh


