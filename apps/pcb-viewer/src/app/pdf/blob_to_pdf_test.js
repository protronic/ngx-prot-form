fetch('http://prot-subuntu:8081/cad', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({q: `
    USE cad;

    SELECT 
      document
    FROM 
      pdf_documents
    WHERE
      platine_komplett = '0603000303'
  `})  
})
  .then(data => data.json())
  .then(data => data.recordset[0].document['data'])
  .then(array_to_pdf_file)


const array_to_pdf_file = function (array){
  const arraBuffer = (new Uint8Array(array)).buffer;
  const fileBlob = new Blob([arraBuffer], {type: 'application/pdf'});
  const file = new File([fileBlob], 'bestückungsplan.pdf', {type: 'application/pdf'});
  const fileUrl = URL.createObjectURL(file);
  console.log(fileUrl)
  return fileUrl
}











