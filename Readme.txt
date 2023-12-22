Inventory is running fine.


Invoice :-

Users - SignUp, Login, forgotPassword - post APis

Invoice - Crud - post, get, getById, update, delete, nextInvoice, invoicePayment

InvoicePayment - so in this when we create any invoice it also get created so with this we can see how much amount is recieved or pending from customers. It created from invoice post API.

PaymentTerm - Crud - post, get, getById, update, delete 

Customer - Crud - post, get, getById, update, delete

Product - post, get, getById, update, delete, bulkUploadImport, ExportProduct

Tax - Crud - post, get, getById, update, delete

TDS - Crud - post, get, getById, update, delete

Unit - Crud - post, get, getById, update, delete


In customer there is one field of tax preference which is default taxable so we have to change the UI according to it and also some numbers (invoice number) we need to check that

In invoice with nextInvoice api you will get next number of invoice but you always have to pass first branch there so whenver you create first invoice you can create branch with default invoice number INV-00001 like this and after that if anyone choose again the same branch nextInvoice api should call and you will get nextInvoice number and in this we also have to create some state or city wise like INV-00001/KA, INV-00001/MH, INV-00001/TN like this also we need to write year like this INV-00001/MH/23-24.