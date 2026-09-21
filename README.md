### Instructions

#### On Raspberry PI

1. Install nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Create website folder:
   ```bash
   sudo mkdir -p /usr/share/nginx/html/clock
   sudo chown raspberrypi /usr/share/nginx/html/clock
   ```

3. Find out IP address:
   ```bash
   hostname -I
   ```
   
4. Add user to `www-data` group:
    ```bash
    sudo usermod -a -G www-data raspberrypi
    ```

5. Set screen brightness to 30% 

6. Set auto login to ON in `raspi-config` > System options
   ```bash
   sudo raspi-config
   ``` 

#### On source computer

1. ```bash
   npm run build -- --base=./
   ```

2. ```bash
   scp -r ./dist/* raspberrypi@<IPADRESS>:/var/www/html/clock
   ```

#### On Raspberry PI again

1. Set google calendar id in config
   ```bash
   sudo nano /var/www/html/clock/config.json
   ```

2. Follow instructions here to install a font with emojis: https://www.omgubuntu.co.uk/2016/08/enable-color-emoji-linux-google-chrome-noto

2. Add this line to the `~/.config/labwc/autostart` file:
   ```bash
   chromium --kiosk --start-maximized http://localhost/clock/index.html
   ```
