const express = require('express')
const path = require('path')
const multer = require('multer')

const app = express()
const port = 3000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
  
const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: 'YDSmb3cJtfKhM_ZpsptRbDCE_r8r-CDrnvwKocKeF7gI',
    }),
    serviceUrl: 'https://api.us-south.speech-to-text.watson.cloud.ibm.com/instances/17a8e5b1-10e2-43d6-8533-00cf335fd628',
});
  
const upload = multer({ storage: storage })

app.get('/', (request, response) => response.send('Hello World! please goto /upload for speech recognition'))

app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'upload.html')))

app.post('/upload', upload.single('file'), function (req, res) {
filename = 'uploads/' + req.file.originalname;
    console.log(filename + 'を認識中');

    var search_word = req.body['message'];
    if (search_word == "") {console.log('検索ワードはなしですね')}
    else console.log('検索ワードは' + search_word);
    var msg = "Wtason STTで認識したのは<br>";
    var str = "";    
    
    const recognizeParams = {
      audio: fs.createReadStream(filename),
      contentType: 'audio/mp3',
      model: 'ja-JP_NarrowbandModel',
      keywords: ['桃', '男'],
      keywordsThreshold: 0.5,
    };
  
    speechToText.recognize(recognizeParams)
    .then(speechRecognitionResults => {
    for (r of speechRecognitionResults.result.results){
      console.log(r.alternatives[0].transcript);
      str = str + r.alternatives[0].transcript;
      };
      str = str.replace(/\s+/g, "");

      var search_word_nagasa = search_word.length;
      var moji_nagasa = str.length;
      var j = 0;
      let s_array = [0];
      let e_array = [0];

      if (search_word == "") {msg = msg + str + '<br><br>' + '検索ワードはなしですね'}
      else {
        msg = msg + str + '<br><br>' + '検索ワードは' + search_word + '<br>';
      for (let i = 1; i < moji_nagasa; i++) {
        var result = str.indexOf(search_word, i);
      
        if(result !== -1) {
          j=j +1;
          s_array.push(result-5);
          e_array.push(result+search_word_nagasa+5);
          msg = msg + str.substring(s_array[j], e_array[j]) + '<br>';
          i=i + result;
          }
        }
      }
      msg = msg + '<br>' + '文中の位置は' + '<br>';
      var k = 1;
      for (let i = 0; i < moji_nagasa; i++) {
      if(i==s_array[k]) {msg = msg + '<<-' + str.substring(i,i+1)}
      else  if(i==e_array[k]) {
        msg = msg + '->>' + str.substring(i,i+1);
        k = k +1;
      }
      else {
        msg = msg + str.substring(i,i+1);
      }
      }

      
      var data = {
          title: 'Text',
          content: msg
        };
        res.send(msg);
    }
    
    )

})

app.listen(port,function(){
	console.log(`Example app listening on port ${port}!`)
})
