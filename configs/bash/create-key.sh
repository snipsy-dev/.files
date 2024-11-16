echo "creating ssh key..."
ssh-keygen -t ed25519 -C "snipsy69@gmail.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
