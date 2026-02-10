const PDFDocument = require('pdfkit');
const fs = require('fs');
const PDFgenerator= require('./RelatorioPDF');

class Report {

    async generateUserReport(object, fileName = 'User Report.pdf'){

        let flag = false
        
        try {
            const userList = await prisma.user.findMany()
    
            if(userList == null)
                console.log("There's no users registered")
        
            // Document creation
            const doc = new PDFDocument()
            // Where fille gonna be saved
            doc.pipe(fs.createWriteStream(fileName))
            // Add hadder
            doc.fontSize(25).text("Finance Report", { alig: 'center' })
            doc.moveDown() // JumpLine

            object.array.forEach((item,index) => {
                const line = `${index + 1}. ${item.description} - R$ ${item.value.toFixed(2)}`
                doc.fontSize(12).text(line)
            });

            flag = true

            if(flag == true)
                console.log("Report successfuly created!")
            doc.end()

        } catch (error) {   
            console.error("Report was not created. Try again!", error)
        }
    }
}

module.exports = Report;