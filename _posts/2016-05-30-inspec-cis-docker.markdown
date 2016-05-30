---
layout: post
title: "Docker Security Tool: InSpec CIS Docker Benchmark"
date:   2016-05-30 19:00:00
image:
      url: /assets/article_images/2016-05-30-inspec-cis-docker/cover.jpeg
video: false
comments: true
theme_color: 302F2D

author: 'Patrick Münch'
#author_image: /assets/images/7220740.patrick.jpg
author_image: "https://avatars0.githubusercontent.com/u/7220740?s=400"
author_link: "https://twitter.com/atomiczero111"
---

We have recently published the new InSpec CIS Docker Benchmark profile. This [InSpec](https://github.com/chef/inspec) compliance profile implement the [CIS Docker 1.11.0 Benchmark](https://benchmarks.cisecurity.org/tools2/docker/CIS_Docker_1.11.0_Benchmark_v1.0.0.pdf) in an automated way to provide security best-practice tests around the Docker daemon and containers in a production environment.

Having the CIS document is very important, but to have the ability to execute the benchmarks and to get immediately a status of your running environment is equally important. To achive the goal we have implemented the CIS Docker Benchmarks for Security which automates inpsecting a host configuration against the CIS Benchmark recommendations. We also started to include some attributes that you can configure tests to meet your production environment.

We are using InSpec to implement the CIS Docker Benchmark. InSpec is an open-source testing framework for infrastructure with a human- and machine-readable language for specifying compliance, security and policy requirements.

InSpec stands for "infrastructure specification" and is also a contraction of "inspect." You can use InSpec to examine any node in your infrastructure. The InSpec framework is working locally on the node being inspected and also remotely to inspect a node via ssh. As input, it uses controls you write with the InSpec language. If it detects security, compliance or policy issues they are flagged in a log.

You can find here the requirements to run the InSpec CIS Docker Benchmark: [InSpec Installation](https://github.com/chef/inspec#installation)

I started a Centos 7 vagrant box and implemented all CIS Docker Benchmark recommendations to secure the Docker daemon and one container.

First of all download the github repo:

```bash
git clone inspec exec https://github.com/dev-sec/cis-docker-benchmark.git -t ssh://vagrant@127.0.0.1 --port 2222 --key-files vm_docker/.vagrant/machines/centos7/virtualbox/private_key --sud
```

Next you can execute the InSpec profile with


```bash
∅> inspec exec cis-docker-benchmark -t ssh://vagrant@127.0.0.1 --port 2222 --key-files vm_docker/.vagrant/machines/centos7/virtualbox/private_key --sudo
```
or you can execute it directly from the github repo like:

```bash
inspec exec https://github.com/dev-sec/cis-docker-benchmark.git -t ssh://vagrant@127.0.0.1 --port 2222 --key-files vm_docker/.vagrant/machines/centos7/virtualbox/private_key --sud
```

```bash
Pending: (Failures listed here are expected and do not affect your suite's status)

  1) Operating System Detection Skipped control due to only_if condition.                                                                                                                       
     # Not yet implemented
     #

  2) Operating System Detection Skipped control due to only_if condition.                                                                                                                       
     # Not yet implemented
     #

  3) Operating System Detection Skipped control due to only_if condition.                                                                                                                       
     # Not yet implemented
     #

  4) Operating System Detection Skipped control due to only_if condition.                                                                                                                       
     # Not yet implemented
     #


Failures:

  1) Json /etc/docker/daemon.json ["default-ulimits", "nproc"] should eq "1024:2408"
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }

       expected: "1024:2408"
            got: nil

       (compared using ==)
     # cis-docker-benchmark/controls/docker_level1.rb:120:in `block (3 levels) in load'

  2) Json /etc/docker/daemon.json ["default-ulimits", "nofile"] should eq "100:200"
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }

       expected: "100:200"
            got: nil

       (compared using ==)
     # cis-docker-benchmark/controls/docker_level1.rb:123:in `block (3 levels) in load'

  3) {"Id"=>"d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d", "Created"=>"2016-05-30T07:31:58.879644757Z", "Path"=>"/bin/bash", "Args"=>["-c", "while true; do echo hello world; sleep 1; done"], "State"=>{"Status"=>"running", "Running"=>true, "Paused"=>false, "Restarting"=>false, "OOMKilled"=>false, "Dead"=>false, "Pid"=>21019, "ExitCode"=>0, "Error"=>"", "StartedAt"=>"2016-05-30T07:31:59.183990208Z", "FinishedAt"=>"0001-01-01T00:00:00Z"}, "Image"=>"sha256:26bb67a2a5908b2c9858a69be0160f4610ddfb956b775f975e748ee85736b417", "ResolvConfPath"=>"/var/lib/docker/containers/d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d/resolv.conf", "HostnamePath"=>"/var/lib/docker/containers/d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d/hostname", "HostsPath"=>"/var/lib/docker/containers/d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d/hosts", "LogPath"=>"/var/lib/docker/containers/d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d/d959bba770f00a2a58c235002b530418d886b814b3743806c49838442b11106d-json.log", "Name"=>"/ubuntu-test", "RestartCount"=>0, "Driver"=>"devicemapper", "MountLabel"=>"system_u:object_r:svirt_sandbox_file_t:s0-s0:c1023", "ProcessLabel"=>"system_u:system_r:svirt_lxc_net_t:s0-s0:c1023", "AppArmorProfile"=>"", "ExecIDs"=>nil, "HostConfig"=>{"Binds"=>["/tmp:/test"], "ContainerIDFile"=>"", "LogConfig"=>{"Type"=>"json-file", "Config"=>nil}, "NetworkMode"=>"default", "PortBindings"=>{"23/tcp"=>[{"HostIp"=>"172.17.0.1", "HostPort"=>"2222"}]}, "RestartPolicy"=>{"Name"=>"on-failure", "MaximumRetryCount"=>5}, "AutoRemove"=>false, "VolumeDriver"=>"", "VolumesFrom"=>nil, "CapAdd"=>nil, "CapDrop"=>["all"], "Dns"=>[], "DnsOptions"=>[], "DnsSearch"=>[], "ExtraHosts"=>nil, "GroupAdd"=>nil, "IpcMode"=>"", "Cgroup"=>"", "Links"=>nil, "OomScoreAdj"=>0, "PidMode"=>"", "Privileged"=>false, "PublishAllPorts"=>false, "ReadonlyRootfs"=>true, "SecurityOpt"=>["label:level:s0-s0:c1023", "seccomp={\"defaultAction\":\"SCMP_ACT_ALLOW\",\"syscalls\":[{\"name\":\"mkdir\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]},{\"name\":\"chown\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]}]}"], "StorageOpt"=>nil, "UTSMode"=>"", "UsernsMode"=>"", "ShmSize"=>67108864, "ConsoleSize"=>[0, 0], "Isolation"=>"", "CpuShares"=>512, "Memory"=>268435456, "CgroupParent"=>"", "BlkioWeight"=>0, "BlkioWeightDevice"=>nil, "BlkioDeviceReadBps"=>nil, "BlkioDeviceWriteBps"=>nil, "BlkioDeviceReadIOps"=>nil, "BlkioDeviceWriteIOps"=>nil, "CpuPeriod"=>0, "CpuQuota"=>0, "CpusetCpus"=>"", "CpusetMems"=>"", "Devices"=>[], "DiskQuota"=>0, "KernelMemory"=>0, "MemoryReservation"=>0, "MemorySwap"=>536870912, "MemorySwappiness"=>-1, "OomKillDisable"=>false, "PidsLimit"=>0, "Ulimits"=>nil, "CpuCount"=>0, "CpuPercent"=>0, "BlkioIOps"=>0, "BlkioBps"=>0, "SandboxSize"=>0}, "GraphDriver"=>{"Name"=>"devicemapper", "Data"=>{"DeviceId"=>"61", "DeviceName"=>"docker-8:17-311297-1b14cce13804c1db6d55a208a92cface12ff89cca4916f01e4199a776019fad8", "DeviceSize"=>"10737418240"}}, "Mounts"=>[{"Source"=>"/tmp", "Destination"=>"/test", "Mode"=>"", "RW"=>true, "Propagation"=>"rprivate"}], "Config"=>{"Hostname"=>"d959bba770f0", "Domainname"=>"", "User"=>"ubuntu", "AttachStdin"=>false, "AttachStdout"=>false, "AttachStderr"=>false, "ExposedPorts"=>{"23/tcp"=>{}}, "Tty"=>false, "OpenStdin"=>false, "StdinOnce"=>false, "Env"=>["PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"], "Cmd"=>["/bin/bash", "-c", "while true; do echo hello world; sleep 1; done"], "Image"=>"ubuntu-test:latest", "Volumes"=>nil, "WorkingDir"=>"", "Entrypoint"=>nil, "OnBuild"=>nil, "Labels"=>{}}, "NetworkSettings"=>{"Bridge"=>"", "SandboxID"=>"a5a927291513b5d6a8910463bc7ea7242339a6f20e0cdee29325dc83bdc4cf29", "HairpinMode"=>false, "LinkLocalIPv6Address"=>"", "LinkLocalIPv6PrefixLen"=>0, "Ports"=>{"23/tcp"=>[{"HostIp"=>"172.17.0.1", "HostPort"=>"2222"}]}, "SandboxKey"=>"/var/run/docker/netns/a5a927291513", "SecondaryIPAddresses"=>nil, "SecondaryIPv6Addresses"=>nil, "EndpointID"=>"f1f27a98c24c57e4caba3010259d5c0a4e35ad6c01203136e68cb7563eca1b56", "Gateway"=>"172.17.0.1", "GlobalIPv6Address"=>"", "GlobalIPv6PrefixLen"=>0, "IPAddress"=>"172.17.0.2", "IPPrefixLen"=>16, "IPv6Gateway"=>"", "MacAddress"=>"02:42:ac:11:00:02", "Networks"=>{"bridge"=>{"IPAMConfig"=>nil, "Links"=>nil, "Aliases"=>nil, "NetworkID"=>"d3c5d5da0b0c8d7a5567659635889697272219770d4a71554daed671526fb3b3", "EndpointID"=>"f1f27a98c24c57e4caba3010259d5c0a4e35ad6c01203136e68cb7563eca1b56", "Gateway"=>"172.17.0.1", "IPAddress"=>"172.17.0.2", "IPPrefixLen"=>16, "IPv6Gateway"=>"", "GlobalIPv6Address"=>"", "GlobalIPv6PrefixLen"=>0, "MacAddress"=>"02:42:ac:11:00:02"}}}} ["HostConfig", "SecurityOpt"] should include /no-new-privileges/
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }

       expected ["label:level:s0-s0:c1023", "seccomp={\"defaultAction\":\"SCMP_ACT_ALLOW\",\"syscalls\":[{\"name\":\"mkdir\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]},{\"name\":\"chown\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]}]}"] to include /no-new-privileges/                                                                                                                       
       Diff:
       @@ -1,2 +1,3 @@
       -[/no-new-privileges/]
       +["label:level:s0-s0:c1023",
       + "seccomp={\"defaultAction\":\"SCMP_ACT_ALLOW\",\"syscalls\":[{\"name\":\"mkdir\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]},{\"name\":\"chown\",\"action\":\"SCMP_ACT_ERRNO\",\"args\":[]}]}"]                                                                                                                                                                                         

     # cis-docker-benchmark/controls/docker_level1.rb:903:in `block (4 levels) in load'

  4) Json /etc/docker/daemon.json ["userns-remap"] should eq "default"
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }

       expected: "default"
            got: nil

       (compared using ==)
     # cis-docker-benchmark/controls/docker_level2.rb:37:in `block (3 levels) in load'

  5) Json /etc/docker/daemon.json ["log-driver"] should not be empty
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }
       expected nil to respond to `empty?`
     # cis-docker-benchmark/controls/docker_level2.rb:88:in `block (3 levels) in load'

  6) Json /etc/docker/daemon.json ["log-driver"] should eq "syslog"
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }

       expected: "syslog"
            got: nil

       (compared using ==)
     # cis-docker-benchmark/controls/docker_level2.rb:91:in `block (3 levels) in load'

  7) Json /etc/docker/daemon.json ["log-opts"] should include /syslog-address/
     Failure/Error: DEFAULT_FAILURE_NOTIFIER = lambda { |failure, _opts| raise failure }
       expected nil to include /syslog-address/, but it does not respond to `include?`
     # cis-docker-benchmark/controls/docker_level2.rb:94:in `block (3 levels) in load'

Finished in 1.1 seconds (files took 10.51 seconds to load)
197 examples, 7 failures, 4 pending
```

As you can see it runs 197 InSpec tests with 7 failures. I am waiting that docker fixes tis failures:

- https://docs.docker.com/engine/reference/commandline/daemon/#default-ulimits
- https://github.com/docker/docker/issues/21050
- https://github.com/docker/docker/issues/22311
