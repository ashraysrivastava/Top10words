//requesting the modules
const request= require('request');
const stopwords=require('stopword');

//fetching the document from the API 
async function data(){
let dataurl="http://norvig.com/big.txt";
return new Promise((resolve,reject) =>{
    request(dataurl,function(error,response,body){
        if(error){
            reject(error);
        }else{
            resolve(body);
        }
    })
});
}

//function to extract top 10 words from the document
async function wordFreq(string) {
    var wordsMap = {};
    var finalWordsArray = [];
    var relevantwords = string.split(/\s+/);//converting document to array
    var wordsArray=stopwords.removeStopwords(relevantwords)//removing the basic stopwords using the stopword module
    //iterating over the array using Hash property 
    wordsArray.forEach(function (key) {
        if (wordsMap.hasOwnProperty(key)) {
          wordsMap[key]++;//incrementing the count of words if key is present
        } else {
          wordsMap[key] = 1;//else creating object record with value as 1
        }
      });
      //creating object with their final count  
      finalWordsArray = Object.keys(wordsMap).map(function (key) {
        return {
          name: key,//name of word
          total: wordsMap[key]//total frequency 
        };
      });
      //sorting the object in descending order
      finalWordsArray.sort(function (a, b) {
        return b.total - a.total;
      });
      //slicing the top 10 words from the object
      var topwords = finalWordsArray.sort((a,b) => b-a).slice(0,10);
      //returning the top 10 words
      return topwords;

}

//function to fetch response from the dictionary.Yandex API
async function getwordsdetails(word){
    var url="https://dictionary.yandex.net/api/v1/dicservice.json/lookup";//url
    var key='dict.1.1.20200829T082546Z.21be02488b05ab20.525446d7102d5abd50861916ddfd2efb33e630d7';//API Key
    var lang='en-en';//using lang as en to en
    var text=word;//sending the word for which details needs to be fetched
    var finalurl=url+"?key="+key+"&lang="+lang+"&text="+text;//finalrequest url
    // var finalurl='https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20200829T082546Z.21be02488b05ab20.525446d7102d5abd50861916ddfd2efb33e630d7&lang=en-en&text='+text;
    return new Promise((resolve,reject) =>{
        request(finalurl,function(error,response,body){
            if(error){
                reject(error);
            }else{
                resolve(JSON.parse(body));//resolving the response
            }
        })
    });    
}

//function to create the final JSON output which needs to be displayed
async function extractpos(dataresponse,count){
    var finaloutput={}
    for(var i=0;i<dataresponse.length;i++){
        finaloutput={//adding the parameters
            "Word":dataresponse[i].text,
            "Total_Occurence_in_Document": count,
            "Part_Of_Speech":dataresponse[i].pos,
            "Synonyms":dataresponse[i].tr
            
        }
        return(finaloutput)
    }  
}

//main function to process the data
async function fetchdata(){
    try{
        var result = await data();// request source data from API
        var wordcount= await wordFreq(result);// perform text preprocessing and get top 10 words
        for(let i=0;i<wordcount.length;i++){//looping over top 10 words
            var jsonresult= await getwordsdetails(wordcount[i].name)//getting response for word using dictionary.Yandex API
            var tempresult=await extractpos(jsonresult.def,wordcount[i].total)//fetching the final JSON output for word
            console.log(tempresult)//printing the result
        }
      
        
    }
    catch(err){
        console.log(err)
    }
}

fetchdata();