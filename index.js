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
  
  // const upload = multer({ dest: 'public/uploads/' })
  const upload = multer({ storage: storage })

// app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (request, response) => response.send('Hello World! please goto /upload for speech recognition'))

app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'upload.html')))

app.post('/upload', upload.single('file'), function (req, res) {
//    res.send(req.file.originalname + 'ファイルのアップロードが完了しました。');
filename = 'uploads/' + req.file.originalname;
//    filename= 'uploads/' + filename;
    console.log(filename + 'を認識中');

    var search_word = req.body['message'];
    console.log('検索ワードは' + search_word);
    var msg = "";
    var str = "";    
    
    const recognizeParams = {
      audio: fs.createReadStream(filename),
      contentType: 'audio/mp3',
      model: 'ja-JP_NarrowbandModel',
    //  wordAlternativesThreshold: 0.9,
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

//      var search_word = 'おじいさん';
      var search_word_nagasa = search_word.length;
      var moji_nagasa = str.length;
      var point = 0;

      msg = str + '<br>' + '検索ワードは' + search_word + '<br>';

      for (let i = 1; i < moji_nagasa; i++) {
        var result = str.indexOf(search_word, i);
        if(result !== -1) {
          console.log (str.substring( result-5, result+search_word_nagasa+5));
          msg = msg + str.substring( result-5, result+search_word_nagasa+5) + '<br>';
          i=i + result;
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
