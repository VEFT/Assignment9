sudo sh -c 'echo "127.0.0.1 mymachine.foo.com" >> /etc/hosts'
sudo hostname mymachine.foo.com 
sudo hostname mymachine.foo.com
-- OUTPUT: Password:
hostname mymachine.foo.com
ping mymachine.foo.com
-- OUTPUT: PING mymachine.foo.com (127.0.0.1): 56 data bytes 64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.051 ms 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.104 ms


bin/zookeeper-server-start.sh config/zookeeper.properties 
bin/kafka-server-start.sh config/server.properties

