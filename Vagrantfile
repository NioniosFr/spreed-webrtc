# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.provider "virtualbox" do |v|
    v.gui = false
  end

  config.vbguest.auto_update = false

  # `vagrant box outdated`. This is not recommended.
  config.vm.box_check_update = false

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.33.20"
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 8443, host: 8443

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  config.vm.synced_folder "./", "/vagrant",
    owner: "ubuntu", group: "ubuntu",
    mount_options: ["dmode=755,fmode=644"]

  config.vm.synced_folder "./.vagrant", "/vagrant/.vagrant",
    owner: "ubuntu", group: "ubuntu",
    mount_options: ["dmode=755,fmode=600"]

  config.vm.synced_folder "./src", "/home/ubuntu/Workspace/spreed-webrtc/src",
    owner: "ubuntu", group: "ubuntu",
    mount_options: ["dmode=755,fmode=644"]

  config.vm.synced_folder "./go", "/home/ubuntu/Workspace/spreed-webrtc/go",
    owner: "ubuntu", group: "ubuntu",
    mount_options: ["dmode=755,fmode=644"]

  config.vm.synced_folder "./static", "/home/ubuntu/Workspace/spreed-webrtc/static",
    owner: "ubuntu", group: "ubuntu",
    mount_options: ["dmode=755,fmode=644"]

$ansible = <<SCRIPT
apt-get install -y software-properties-common
apt-add-repository -y ppa:ansible/ansible
apt-get update
apt-get install -y ansible
ansible-galaxy install -r /vagrant/ansible/roles/roles.yml
SCRIPT

config.vm.provision "shell", inline: $ansible
config.vm.provision "file", source: "./ansible/ansible.cfg", destination: "~/ansible.cfg"

  config.vm.provision "ansible_local" do |ansible|
    ansible.inventory_path = "ansible"
    provisioning_path      = "/vagrant/ansible"
    ansible.playbook       = "ansible/main.yml"
    ansible.limit          = "all" # or only "nodes" group, etc.
    ansible.verbose        = true
    ansible.install_mode   = "default"
    ansible.install        = false
  end

end
