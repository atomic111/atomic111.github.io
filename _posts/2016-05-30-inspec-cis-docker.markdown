---
layout: post
title: "Docker Security Tool: InSpec CIS Docker Benchmark"
date:   2016-05-30 10:00:00
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

As you can see it runs 197 InSpec tests with 7 failures. I am waiting that docker fixes those failures:

- https://docs.docker.com/engine/reference/commandline/daemon/#default-ulimits
- https://github.com/docker/docker/issues/21050
- https://github.com/docker/docker/issues/22311
