# SEO Blog Writer

This is a simple project which usages Open AI API, puppeteer and duplichecker.com to generate seo friendly blogs.

### Working

1. Users gives title/topic and instructions
2. Based on the input it generates an article/blog by Open AI API.
3. Once generated it usages puppeteer to visit duplichecker.com and processes and respond back with results and the content.


### Packages
* express
* dotenv
* openai
* puppeteer
* puppeteer-extra
* puppeteer-extra-plugin-adblocker
* puppeteer-extra-plugin-recaptcha

* nodemon - dev 

### Usages
- `npm install`: install the required packages
- update the openai api key and the 2captcha.com key
- `npm start`