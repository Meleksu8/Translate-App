export const translate = async (text, languageFrom, languageTo)=>{
    
    const axios = require('axios');
    const options = {
    method: 'GET',
    url: 'https://nlp-translation.p.rapidapi.com/v1/translate',
    params: {
        text: text,
        to: languageTo,
        from: languageFrom
    },
    headers: {
        'x-rapidapi-key': 'f131df649bmsh4dbd29131aae86cp1c1be4jsnffd9e89d1993',
        'x-rapidapi-host': ''
    }
    };

    const response = await axios.request(options).catch(function(error){
        console.error(error);
    });
    
    if (response.status !== 200) {
        console.log(response);
        throw new Error("Translate call failed. Response status: " + response.status);
    }
    return response.data;
}