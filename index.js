const xlsx = require('xlsx');
const request = require('request');


console.log("Running");

//list of tested zip codes
const testedZip_Codes = ['32517', '73101', '90608', '10210', '25436', '48121', '71000', '18310', '73101', '48121', '07477', '56632', '20122', '25000',
  '6100', '15800', '75832','21139','33195','23905','88227','48046','56632','76057','49041','81100','46519','50059','97512','90608','31199','25436','10210',
    '82602','84551','33195','23905','75085','21139','36996','94142','75832','88227','21139'];

// Zip Codes to test
const ZIP_CODES = ['27611','13311', '2000','5107', '38197','12345','76101','57491','04122','99511',  '80912','43234','25781','65328','20100','11011','79409','07689','77383' ,'62304','77710','28028', '89254','00937','93700','11123','77556','45451' ,'42820','52546','46801','08601','22785', '90927','30015', '91954', '72203','92467','92581','30015' ];
const numberOfZips = ZIP_CODES.length;
let counter = 0;


// Construct the API endpoint URL
const url = `http://ZiptasticAPI.com/`;

// Create a new workbook and sheet
const workbook = xlsx.utils.book_new();
//const sheet = xlsx.utils.json_to_sheet([{ zip_code: "", state: "", valid_zip: "", city: "", country: "" }]);

// create sheet and add headers
const sheet = xlsx.utils.aoa_to_sheet([["zipCode", "city", "state", "Valid Zip?", "Country"]]);


function capitalizeFirstLetter (string) {
  string = string.toLowerCase();
  let words = string.split(" ");
  string = words.map((word) => {
    return word[0].toUpperCase() + word.substring(1);
  }).join(" ");
  return string;
}


// Loop through each zip code and add data to the sheet
for (const zipCode of ZIP_CODES) {

  request(url + zipCode, function (error, response, body) {

    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);

      if (data) {
        // Extract data from the response and add it to the sheet
        const city = data.city ? capitalizeFirstLetter(data.city) : "none";
        console.log({ city });
        console.log({ zipCode });
        const state = data.state ? data.state : "none";
        const country = data.country ? data.country : "none";
        const error = data.error ? "Bad" : "Good";

        xlsx.utils.sheet_add_aoa(sheet, [[zipCode, city, state, error, country]], { origin: -1 });
        counter += 1;
        console.log(counter);
      }


      // If an error occurred or no data was returned, add an empty row to the sheet
      else {
        console.log(`Error checking zip code ${zipCode}: ${response.statusCode}`);
        xlsx.utils.sheet_add_aoa(sheet, [[zipCode, '', '', '']]);
        counter += 1;
        console.log(counter);
      }

      // If all requests have completed, write the workbook to a file
      // if (zipCode === ZIP_CODES[ZIP_CODES.length - 1]) {
      if (counter === numberOfZips) {
        console.log("End of array reached!");
        // add the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, sheet, 'Zip Codes');
        // write the workbook to a file
        xlsx.writeFile(workbook, 'zip_codes.xlsx');
      }
    }
  });
}