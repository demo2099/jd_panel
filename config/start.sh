#! /bin/bash
docker rm -f $(docker ps -a | grep hellojd | awk '{print $1}')
#docker rmi demo/jd_scripts
#docker build -t demo/jd_scripts .

ckArray=($(awk '{print $1}' ck.conf))
cd ../
for(( i=0;i<${#ckArray[@]};i++)) do
	#${#array[@]}获取数组长度用于循环

	mkdir jd_scripts$i
	cp -r  config/*  jd_scripts$i
	cd jd_scripts$i
	sed -i 's/JD_COOKIE=.*/JD_COOKIE='${ckArray[i]}'/g' docker-compose.yml
	sed -i 's/container_name.*/container_name: hellojd'$i'/g' docker-compose.yml
	docker-compose up -d
	cd ../
	rm -rf hellojd$i
done;
