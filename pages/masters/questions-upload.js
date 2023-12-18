import { USER_FULLNAME, USER_ID } from '@/constants/appconstants';
import { db, storage } from '@/firebase/firebaseconfig';
import { arrayUnion, collection, doc, getDocs, increment, orderBy, query, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ulid } from 'ulid';
import Header from '../../components/header';
import Sidebar from '../../components/sidebar';
import {
  ASMT_CODE,
  ASMT_COLLECTION,
  ASMT_LOGS,
  ASMT_QUESTIONS,
  ASMT_TOTAL,
  ASMT_UID,
  LESSON_CODE,
  LESSON_COLLECTION, LESSON_COURSE, LESSON_NAME, LESSON_SUBJECT,
  QUESTIONTYPE,
  QUESTION_CODE,
  QUESTION_COLLECTION,
  QUESTION_COMPLEXITY,
  QUESTION_COMPREHENSION,
  QUESTION_IMAGEURLS,
  QUESTION_LESSONSUID,
  QUESTION_LOGS,
  QUESTION_ONLYASSESSMENT,
  QUESTION_OPTIONS,
  QUESTION_STATUS,
  QUESTION_SUBTYPE,
  QUESTION_TEXT,
  QUESTION_TYPE,
  QUESTION_UID
} from '../../firebase/firebaseConstants';
import * as utility from '../../libraries/utility';
var excelData = []
var excelImageFiles = []
var excelImageFileNames = []
const XLSX = require('xlsx');
const Questions = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [allASMTCodes, setallASMTCodes] = useState({});
  const [allLessons, setallLessons] = useState({});
  const [uploadDetails, setuploadDetails] = useState({});
  const showsnackbar = (variant, message) => {
    enqueueSnackbar(message, {
      variant: variant,
      anchorOrigin: { horizontal: 'right', vertical: 'top' },
    });
  };
  const errorCallback = (err) => {
    utility.hideloading();
    showsnackbar('error', err.message);
  };
  async function getAllAssessments() {
    var asmtCodes = {};
    utility.showloading();
    try {
      const asmtReF = collection(db, ASMT_COLLECTION);

      const q = query(asmtReF);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        asmtCodes[doc.data()[ASMT_CODE].toString().toUpperCase()] = doc.data()
      });
    } catch (error) {

      errorCallback(error);
    }
    setallASMTCodes(asmtCodes);
    utility.hideloading()

    getAllLessons()
  }
  async function getAllLessons() {
    var allLessons = [];
    utility.showloading();
    try {
      const lessonReF = collection(db, LESSON_COLLECTION);

      const q = query(lessonReF,
        orderBy(LESSON_NAME));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.data()[LESSON_CODE].toString().toUpperCase());
        allLessons[doc.data()[LESSON_CODE].toString().toUpperCase()] = {
          lessoncode: doc.data()[LESSON_CODE],
          lessonuid: doc.id,
          subjectuid: doc.data()[LESSON_SUBJECT].uid,
          courseuid: doc.data()[LESSON_SUBJECT].uid,
          name: doc.data()[LESSON_NAME] + " | " + doc.data()[LESSON_SUBJECT].name + " | " + doc.data()[LESSON_COURSE].name,
        }
      });
    } catch (error) {

      errorCallback(error);
    }
    setallLessons(allLessons);
    utility.hideloading()
  }


  function downloadTemplate() {
    var filename = 'Questions Template.xlsx';
    var data = [{
      ["ASSESSMENT CODE"]: "",
      ["MARKS"]: "",
      ["NEGATIVE MARKS"]: "",
      ["QUESTION CODE"]: "",
      ["QUESTION COMPLEXITY"]: "",
      ["QUESTION TYPE"]: "",
      ["QUESTION SUBTYPE"]: "",
      ["ONLY ASSESSMENT"]: "",
      ["LESSON CODES"]: "",
      ["QUESTION TEXT"]: "",
      ["QUESTION COMPREHENSION"]: "",
      ["QUESTION IMAGES"]: "",
      ["QUESTION EXPLAINATION"]: "",
      ["OPT1 TEXT"]: "",
      ["OPT1 IMAGE"]: "",
      ["OPT1 ISCORRECT"]: "",
      ["OPT2 TEXT"]: "",
      ["OPT2 IMAGE"]: "",
      ["OPT2 ISCORRECT"]: "",
      ["OPT3 TEXT"]: "",
      ["OPT3 IMAGE"]: "",
      ["OPT3 ISCORRECT"]: "",
      ["OPT4 TEXT"]: "",
      ["OPT4 IMAGE"]: "",
      ["OPT4 ISCORRECT"]: "",
    }]
    var ws = XLSX.utils.json_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions Template");
    XLSX.writeFile(wb, filename);
  }
  function browseMultipleImages() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpeg,.png,.jpg';
    input.setAttribute('multiple', '');
    input.onchange = _ => {
      $("#questionstablebody").empty()
      excelData = []
      excelImageFileNames = []
      excelImageFiles = []
      var allFiles = Array.from(input.files);
      allFiles.map((file) => {
        if (!excelImageFileNames.includes(file.name.split(".")[0].toUpperCase())) {
          excelImageFileNames.push(file.name.split(".")[0].toUpperCase())

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function () {
            console.log(reader.result);
            excelImageFiles.push({
              filename: file.name.split(".")[0],
              base64: reader.result
            })
          };

        }
      })
      showsnackbar('success', excelImageFileNames.length + " Images Selected, Select Question Excel Now.")

      console.log(excelImageFiles);
      console.log(excelImageFileNames);
    };
    input.click();
  }


  function browseExcel() {

    // if (excelImageFileNames.length === 0) {
    //   showsnackbar('error', "Please Select Images First")
    //   return;
    // }
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xls,.xlsx';
    input.onchange = _ => {

      excelData = []
      let files = Array.from(input.files);
      console.log(files);

      setuploadDetails((saveddetails) => {
        var details = { ...saveddetails }
        details["file"] = {
          filename: files[0].name,
          size: files[0].size,
          lastModified: files[0].lastModified,
          lastModifiedDate: moment(files[0].lastModifiedDate).format("MMM DD YYYY hh:mm:ss a"),
          fileurl: ""
        }

        details["user"] = {
          name: utility.get_keyvalue(USER_FULLNAME),
          uid: utility.get_keyvalue(USER_ID),
        }

        details["time"] = {
          dateuid: utility.getDateUID(),
          yearuid: utility.getDateUID("YYYY"),
          time: utility.getTime(),
          date: utility.getDate(),
          timestamp: utility.getTimestamp(),
        }

        return details
      })
      excelFileToJSON(files[0])
    };
    input.click();
  }

  function excelFileToJSON(file) {
    utility.showloading()
    try {
      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function (e) {

        var data = e.target.result;
        var workbook = XLSX.read(data, {
          type: 'binary',
          raw: false,
          cellDates: false,
          defval: ""
          // dateNF: 'd"/"m"/"yyyy'
        });
        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
          var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {
            defval: "",
            dateNF: 'd"/"m"/"yyyy'
          })
            .map(row =>
              Object.keys(row).reduce((obj, key) => {
                obj[key.trim()] = row[key];
                return obj;
              }, {})
            );
          if (roa.length > 0) {
            result[sheetName] = roa;
          }
        });
        formatExcelData(result)
      }
    } catch (e) {
      console.error(e);
    }
  }


  function formatExcelData(data) {
    console.log(allASMTCodes);
    utility.hideloading()
    Object.keys(data).map(key => {
      try {
        data[key].map(value => {
          if (value["QUESTION TEXT"].toString().trim().length === 0 && value["QUESTION IMAGES"].toString().trim().length === 0) {
            showsnackbar('error', "QUESTION TEXT, QUESTION IMAGES not Found, Invalid Excel Format, Please check your Excel Sheet.")
            return;
          }
          if (value["QUESTION CODE"] === undefined) {
            showsnackbar('error', "QUESTION CODE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          if (!Object.keys(QUESTIONTYPE).includes(value["QUESTION TYPE"].toString().trim().toUpperCase())) {
            showsnackbar('error', "QUESTION TYPE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          if (!["HIGH", "MEDIUM", "LOW"].includes(value["QUESTION COMPLEXITY"].toString().trim().toUpperCase())) {
            showsnackbar('error', "QUESTION COMPLEXITY not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          if (value["QUESTION SUBTYPE"].toString().trim().length > 0 && !["SINGLE", "MULTIPLE"].includes(value["QUESTION SUBTYPE"].toString().trim().toUpperCase())) {
            showsnackbar('error', "QUESTION SUBTYPE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          console.log(value["LESSON CODES"].toString().trim().split(","));
          if (value["LESSON CODES"].toString().trim().split(",").length === 0) {
            showsnackbar('error', "LESSON CODES not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }

          if (value["ASSESSMENT CODE"].toString().trim().length > 0
            && (allASMTCodes[value["ASSESSMENT CODE"].toString().trim().toUpperCase()] === undefined)) {
            showsnackbar('error', "ASSESSMENT CODE Is Not Valid, No Such Assessment Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          if (value["ASSESSMENT CODE"].toString().trim().length > 0 && (value["MARKS"].toString().trim().length == 0 || Number(value["MARKS"].toString().trim()) <= 0)) {
            showsnackbar('error', "MARKS not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }
          if (value["ASSESSMENT CODE"].toString().trim().length > 0 && (Number(value["MARKS"].toString().trim()) < 0)) {
            showsnackbar('error', "NEGATIVE MARKS Invalid, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }

          var questionImages = []
          if (value["QUESTION IMAGES"].toString().trim().length > 0) {
            for (let imagefilename of value["QUESTION IMAGES"].toString().replaceAll(" ", "").split(",")) {
              if (excelImageFileNames.includes(imagefilename)) {
                questionImages.push(excelImageFiles[excelImageFileNames.indexOf(imagefilename)])
              } else {
                console.log(imagefilename);
                showsnackbar('error', imagefilename + ", QUESTION IMAGES not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
                return;
              }
            }
          }



          var options = []

          var option1 = null
          if (value["OPT1 TEXT"].toString().trim().length > 0 || value["OPT1 IMAGE"].toString().trim().length > 0) {
            option1 = {
              uid: utility.randomstring() + "_" + utility.getTimestamp(),
              text: value["OPT1 TEXT"].toString().trim(),
              image: "",
              iscorrect: value["OPT1 ISCORRECT"].toString().trim().toUpperCase() === ("Y" || "YES")
            }
            console.log("OPT1 " + value["OPT1 IMAGE"].toString().trim().length);
            if (value["OPT1 IMAGE"].toString().trim().length > 0) {
              var imagefilename = value["OPT1 IMAGE"].toString().trim()
              if (excelImageFileNames.includes(imagefilename)) {
                console.log("INCLUDES FILE NAME OPT1");
                option1["image"] = excelImageFiles[excelImageFileNames.indexOf(imagefilename)]
              } else {
                showsnackbar('error', "OPT1 IMAGE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
                return;
              }
            }
            options.push(option1)
          }

          var option2 = null
          if (value["OPT2 TEXT"].toString().trim().length > 0 || value["OPT2 IMAGE"].toString().trim().length > 0) {
            option2 = {
              uid: utility.randomstring() + "_" + utility.getTimestamp(),
              text: value["OPT2 TEXT"].toString().trim(),
              image: "",
              iscorrect: value["OPT2 ISCORRECT"].toString().trim().toUpperCase() === ("Y" || "YES")
            }

            if (value["OPT2 IMAGE"].toString().trim().length > 0) {
              var imagefilename2 = value["OPT2 IMAGE"].toString().trim()
              if (excelImageFileNames.includes(imagefilename2)) {
                option2["image"] = excelImageFiles[excelImageFileNames.indexOf(imagefilename2)]
              } else {
                showsnackbar('error', "OPT2 IMAGE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
                return;
              }
            }
            options.push(option2)
          }

          var option3 = null
          if (value["OPT3 TEXT"].toString().trim().length > 0 || value["OPT3 IMAGE"].toString().trim().length > 0) {
            option3 = {
              uid: utility.randomstring() + "_" + utility.getTimestamp(),
              text: value["OPT3 TEXT"].toString().trim(),
              image: "",
              iscorrect: value["OPT3 ISCORRECT"].toString().trim().toUpperCase() === ("Y" || "YES")
            }

            if (value["OPT3 IMAGE"].toString().trim().length > 0) {
              var imagefilename3 = value["OPT3 IMAGE"].toString().trim()
              if (excelImageFileNames.includes(imagefilename3)) {
                option3["image"] = excelImageFiles[excelImageFileNames.indexOf(imagefilename3)]
              } else {
                showsnackbar('error', "OPT3 IMAGE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
                return;
              }
            }
            options.push(option3)
          }

          var option4 = null
          if (value["OPT4 TEXT"].toString().trim().length > 0 || value["OPT4 IMAGE"].toString().trim().length > 0) {
            option4 = {
              uid: utility.randomstring() + "_" + utility.getTimestamp(),
              text: value["OPT4 TEXT"].toString().trim(),
              image: "",
              iscorrect: value["OPT4 ISCORRECT"].toString().trim().toUpperCase() === ("Y" || "YES")
            }

            if (value["OPT4 IMAGE"].toString().trim().length > 0) {
              var imagefilename4 = value["OPT4 IMAGE"].toString().trim()
              if (excelImageFileNames.includes(imagefilename4)) {
                option4["image"] = excelImageFiles[excelImageFileNames.indexOf(imagefilename4)]
              } else {
                showsnackbar('error', "OPT4 IMAGE not Found, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
                return;
              }
            }
            options.push(option4)
          }

          if (options.length === 0) {
            showsnackbar('error', "Options Not Added, Invalid Excel Format, Please check your Excel Sheet, For " + value["QUESTION TEXT"])
            return;
          }

          var lessonCodes = value["LESSON CODES"].toString().trim().toUpperCase().replaceAll(" ", "").split(",")
          var lessonuids = []
          for (let code of lessonCodes) {
            if (allLessons[code.toString().toUpperCase()] === undefined) {
              showsnackbar('error', "Lesson Code Invalid, For " + value["QUESTION TEXT"])
              return;
            } else {
              lessonuids.push(allLessons[code.toString().toUpperCase()].lessonuid)
            }
          }


          var question = {
            ["assessment"]: {
              code: value["ASSESSMENT CODE"].toString().trim().toUpperCase() || "",
              marks: Number(value["MARKS"].toString().trim()) || 0,
              negativemarks: Number(value["NEGATIVE MARKS"].toString().trim()) || 0,
            },
            ["code"]: value["QUESTION CODE"].toString().trim().toUpperCase(),
            ["complexity"]: value["QUESTION COMPLEXITY"].toString().trim().toUpperCase(),
            ["type"]: value["QUESTION TYPE"].toString().trim().toUpperCase(),
            ["subtype"]: value["QUESTION SUBTYPE"].toString().trim().toUpperCase(),
            ["onlyassessment"]: value["ONLY ASSESSMENT"].toString().trim().toUpperCase() === ("Y" || "YES"),
            ["lessonuids"]: lessonuids,
            ["lessoncodes"]: lessonCodes,
            ["text"]: value["QUESTION TEXT"].toString().trim(),
            ["comprehension"]: value["QUESTION COMPREHENSION"].toString().trim(),
            ["images"]: questionImages,
            ["explaination"]: value["QUESTION EXPLAINATION"].toString().trim(),
            ["options"]: options
          }
          excelData.push(question)

        })
        console.log(excelData);
        loadTable()
      } catch (error) {
        console.log(error);
        showsnackbar('error', "Invalid Excel Format, Please check your Excel Sheet.")

        return
      }
    })
  }

  function loadTable() {
    utility.hideitem('browsebutton')
    utility.hideitem('browsephotosbutton')
    utility.showitem('uploadquestionbtn')
    utility.showitem('clearbtn')
    excelData.map((question, index) => {

      var questionImages = ``
      var optionsColumn = ``
      question.options.map((option, index) => {
        var optionImage = ""
        if (option.image.toString().length > 0) {
          optionImage = `<a data-fslightbox href="${option.image.base64}"> <img  src="${option.image.base64}" class="m-1 bg-white rounded shadow-md  w-50px h-50px"></img></a>`
        }
        optionsColumn += `
        <td class="text-sm f-w-500">${option.text}</td>
        <td class="text-sm f-w-500">${optionImage}</td>
        <td class="text-sm f-w-500">${option.iscorrect ? "YES" : ""}</td>
        `
      })
      question.images.map((image, index) => {
        questionImages += `<a data-fslightbox href="${image.base64}"> <img  src="${image.base64}" class="m-1 bg-white rounded shadow-md  w-50px h-50px"></img></a>
        `
      })

      var row = `<tr id="row_${index}" >
                        <td class="text-sm f-w-500">${index + 1}.</td>
                        <td class="text-sm f-w-500">${question.assessment?.code || ""}</td>
                        <td class="text-sm f-w-500">${question.assessment?.marks || ""}</td>
                        <td class="text-sm f-w-500">${question.assessment?.negativemarks || ""}</td>
                        <td class="text-sm f-w-500">${question.code}</td>
                        <td class="text-sm f-w-500">${question.complexity}</td>
                        <td class="text-sm f-w-500">${question.type}</td>
                        <td class="text-sm f-w-500">${question.subtype}</td>
                        <td class="text-sm f-w-500">${question.onlyassessment ? "YES" : ""}</td>
                        <td class="text-sm f-w-500">${question.lessoncodes}</td>
                        <td class="text-sm f-w-500">${question.text}</td>
                        <td class="text-sm f-w-500">${question.comprehension}</td>
                        <td class="text-sm f-w-500"><div class="d-flex flex-row flex-wrap">${questionImages}</div></td>
                        <td class="text-sm f-w-500">${question.explaination}</td>
                        ${optionsColumn}
                  </tr> `
      $("#questionstablebody").append(row)

    })
    refreshFsLightbox();
  }

  function clearAll() {
    $("#questionstablebody").empty()
    excelData = []
    excelImageFileNames = []
    excelImageFiles = []
    utility.showitem('browsebutton')
    utility.showitem('browsephotosbutton')
    utility.hideitem('uploadquestionbtn')
    utility.hideitem('clearbtn')
  }
  async function addOQA_Questions(question, quesindex) {

    var questionuid = ulid();
    var questionImageURLS = []


    var uploadQuestion = async () => {
      var log = {
        message: 'Question Bulk Uploaded ',
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }

      var questionData = {
        [QUESTION_UID]: questionuid,
        [QUESTION_CODE]: question.code,
        [QUESTION_LESSONSUID]: question.lessonuids,
        [QUESTION_TEXT]: question.text,
        [QUESTION_TYPE]: question.type,
        [QUESTION_ONLYASSESSMENT]: question.onlyassessment,
        [QUESTION_COMPLEXITY]: question.complexity,
        [QUESTION_SUBTYPE]: question.subtype,
        [QUESTION_COMPREHENSION]: question.comprehension,
        [QUESTION_STATUS]: true,
        [QUESTION_IMAGEURLS]: questionImageURLS,
        [QUESTION_OPTIONS]: [],
        [QUESTION_LOGS]: arrayUnion(log),
      };
      await setDoc(doc(db, QUESTION_COLLECTION, questionuid), { questionData }, { merge: true });
      if (question.assessment.code.length > 0) {
        await addQuestionToAsmt(question.assessment, questionData)
      }
      beginQuestionUpload(quesindex + 1)

    }
    utility.showloading()
    utility.updateloadingstatus("Uploading Question " + quesindex + "/" + excelData.length)
    if (question.images.length > 0) {
      var counter = 0
      for (let imageFile of question.images) {
        var uploadRef = ref(
          storage,
          'Question/' + questionuid + '/QuestionImages/' + counter + ".png")

        var imageBS64 = imageFile.base64.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "").replace("data:image/jpg;base64,", "")
        uploadString(uploadRef, imageBS64, 'base64', { contentType: 'image/png' })
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              questionImageURLS.push(downloadURL);
              counter++

              if (counter == question.images.length) {
                uploadQuestion()
              }

            });
          })
          .catch((error) => {
            utility.hideloading();
            var message = 'Failed To Upload Image, ' + error.message
            showsnackbar('error', message);
          });
      }
    } else {
      await uploadQuestion()
    }
  }
  async function addMCQ_FTB_MTF_Questions(question, quesindex) {

    var questionuid = ulid();
    var questionImageURLS = []


    var finalOptions = []
    var uploadOptions = async function () {
      async function upload(counter) {
        var option = question.options[counter]
        utility.showloading()
        if (option.image.toString().length > 0) {
          var uploadRef = ref(
            storage,
            'Question/' + questionuid + '/QuestionOptionImages/' + counter + ".png")

          var imageBS64 = option.image.base64.replaceAll("data:image/png;base64,", "").replaceAll("data:image/jpeg;base64,", "").replaceAll("data:image/jpg;base64,", "")
          await uploadString(uploadRef, imageBS64, 'base64', { contentType: 'image/png' })
            .then(async (snapshot) => {
              await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                option.imageurl = downloadURL
                delete option.image
                counter++
                finalOptions.push(JSON.parse(JSON.stringify(option)))
                if (counter == question.options.length) {
                  await uploadQuestion()
                } else {
                  upload(counter)
                }
              });
            })
            .catch((error) => {
              utility.hideloading();
              var message = 'Failed To Upload Image, ' + error.message
              showsnackbar('error', message);
            });
        } else {
          counter++
          delete option.image
          option["imageurl"] = ""
          finalOptions.push(JSON.parse(JSON.stringify(option)))
          if (counter == question.options.length) {
            uploadQuestion()
          } else {
            upload(counter)
          }
        }
      }
      upload(0)
    };

    var uploadQuestion = async () => {
      var log = {
        message: 'Question Bulk Uploaded ',
        name: utility.get_keyvalue(USER_FULLNAME),
        uid: utility.get_keyvalue(USER_ID),
        date: utility.getDateandTime(),
        timestamp: utility.getTimestamp(),
      }

      var questionData = {
        [QUESTION_UID]: questionuid,
        [QUESTION_CODE]: question.code,
        [QUESTION_LESSONSUID]: question.lessonuids,
        [QUESTION_TEXT]: question.text,
        [QUESTION_TYPE]: question.type,
        [QUESTION_ONLYASSESSMENT]: question.onlyassessment,
        [QUESTION_COMPLEXITY]: question.complexity,
        [QUESTION_SUBTYPE]: question.subtype,
        [QUESTION_COMPREHENSION]: question.comprehension,
        [QUESTION_STATUS]: true,
        [QUESTION_IMAGEURLS]: questionImageURLS,
        [QUESTION_OPTIONS]: finalOptions,
        [QUESTION_LOGS]: arrayUnion(log),
      };
      await setDoc(doc(db, QUESTION_COLLECTION, questionuid), questionData, { merge: true });
      console.log("ADDED  :" + questionuid);
      if (question.assessment.code.length > 0) {

        await addQuestionToAsmt(question.assessment, questionData)
      }
      utility.hideloading()

      beginQuestionUpload(quesindex + 1)
    }

    utility.showloading()
    utility.updateloadingstatus("Uploading Question " + quesindex + "/" + excelData.length)
    if (question.images.length > 0) {
      var counter = 0
      for (let imageFile of question.images) {
        console.log(imageFile);
        var uploadRef = ref(
          storage,
          'Question/' + questionuid + '/QuestionImages/' + counter + ".png")

        var imageBS64 = imageFile.base64.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "").replace("data:image/jpg;base64,", "")
        await uploadString(uploadRef, imageBS64, 'base64', { contentType: 'image/png' })
          .then(async (snapshot) => {
            getDownloadURL(snapshot.ref).then(async (downloadURL) => {
              console.log(downloadURL);
              questionImageURLS.push(downloadURL);
              counter++

              if (counter == question.images.length) {
                await uploadOptions()
              }

            });
          })
          .catch((error) => {
            utility.hideloading();
            var message = 'Failed To Upload Image, ' + error.message
            showsnackbar('error', message);
          });
      }
    } else {
      await uploadOptions()
    }
  }


  async function addQuestionToAsmt(asmt, question) {

    var questiontoasmt = {
      uid: question[QUESTION_UID],
      type: question[QUESTION_TYPE],
      subtype: question[QUESTION_SUBTYPE],
      text: question[QUESTION_TEXT],
      complexity: question[QUESTION_COMPLEXITY],
      onlyassessment: question[QUESTION_ONLYASSESSMENT],
      code: question[QUESTION_CODE],
      marks: asmt.marks,
      negativemarks: asmt.negativemarks,
    }

    var log = {
      message: 'Question Added ' + question[QUESTION_CODE],
      name: utility.get_keyvalue(USER_FULLNAME),
      uid: utility.get_keyvalue(USER_ID),
      date: utility.getDateandTime(),
      timestamp: utility.getTimestamp(),
    }
    var asmtUID = allASMTCodes[asmt.code][ASMT_UID]

    await setDoc(doc(db, ASMT_COLLECTION, asmtUID),
      {
        [ASMT_TOTAL]: increment(asmt.marks),
        [ASMT_LOGS]: arrayUnion(log),
        [ASMT_QUESTIONS]: {
          [question[QUESTION_UID]]: questiontoasmt
        },

      }, { merge: true });
    console.log("ASMT ADDED QUESTION " + asmtUID + " : " + question[QUESTION_UID]);
  }

  async function uploadAllQuestions() {

    utility.info_alert(`Upload ${excelData.length} Question?`, 'Are you sure you want to continue?', 'CONTINUE', 'CANCEL', (() => {

      beginQuestionUpload()

    }), null);

  }

  async function beginQuestionUpload(index = 0) {

    if (index >= excelData.length) {
      utility.hideloading()
      utility.success_alert(
        `${excelData.length} Questions Added.`,
        'Details Added successfully.',
        'OKAY',
        utility.reloadPage,
        null
      );
      return
    } else {
      var question = excelData[index]
      await utility.delay()
      console.log(question.type);
      if (["OAQ"].includes(question.type)) {
        await addOQA_Questions(question, index)
      } else if (["MCQ", "FTB", "MTF"].includes(question.type)) {
        try {
          await addMCQ_FTB_MTF_Questions(question, index)
        } catch (error) {
          console.log(error);

        }
      }
      console.log("UPLAODED " + index + "/" + excelData.length);

    }


  }


  useEffect(() => { }, []);
  const handleReadyScript = () => {
    console.log('SCRIPT Ready');
    getAllAssessments()
  };

  const handleLoadScript = () => {
    console.log('SCRIPT LOADED');
  };
  const handleLoadErrorScript = (e) => {
    console.log('SCRIPT Error', e);

    showsnackbar('error', 'Failed To Load Script');
  };

  return (
    <div>
      <Script
        onReady={handleReadyScript}
        onLoad={handleLoadScript}
        onError={handleLoadErrorScript}
        src="../../../assets/plugins/datatables/datatables.bundle.js"
      />
      <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
        <div
          className="app-page flex-column flex-column-fluid"
          id="kt_app_page"
        >
          <Header title={'Questions'} />

          <div
            className="app-wrapper flex-column flex-row-fluid"
            id="kt_app_wrapper"
          >
            <Sidebar />
            <div
              className="app-main flex-column flex-row-fluid py-2 px-4 h-100"
              id="kt_app_main"
            >
              <div className="card h-100">
                <div className="card-header py-2 px-4">
                  <div className="card-title">
                    <div className="d-flex align-items-center position-relative my-1">
                      <span className="svg-icon svg-icon-1 position-absolute ms-6">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.5"
                            x="17.0365"
                            y="15.1223"
                            width="8.15546"
                            height="2"
                            rx="1"
                            transform="rotate(45 17.0365 15.1223)"
                            fill="currentColor"
                          />
                          <path
                            d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>

                      <input
                        type="text"
                        id="searchbox"
                        className="form-control form-control-solid w-250px ps-15"
                        placeholder="Search"
                      />
                    </div>
                  </div>

                  <div className="card-toolbar">
                    <div
                      className="d-flex justify-content-end"
                      data-kt-customer-table-toolbar="base"
                    >
                      <button
                        className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary fs-5 ms-2"
                        type="button" onClick={(e) => downloadTemplate()}
                      // data-bs-target="#modal_adduser"
                      >
                        Download Excel Template
                      </button>
                      <button
                        className="btn btn-sm fs-5 btn-light-primary  btn-flex btn-center btn-active-light-primary ms-2"
                        id="browsebutton" type="button" onClick={(e) => browseExcel()}
                      // data-bs-target="#modal_adduser"
                      >
                        Upload Excel
                      </button>


                      <button
                        className="btn btn-sm fs-5 btn-light-primary  btn-flex btn-center btn-active-light-primary ms-2"
                        id="browsephotosbutton" type="button" onClick={(e) => browseMultipleImages()}
                      // data-bs-target="#modal_adduser"
                      >
                        Upload Images
                      </button>
                      <button
                        className="d-none btn btn-sm fs-5 btn-light-success  btn-flex btn-center btn-active-light-success ms-2"
                        id="uploadquestionbtn" type="button" onClick={(e) => uploadAllQuestions()}
                      // data-bs-target="#modal_adduser"
                      >
                        Upload Questions
                      </button>
                      <button
                        className="d-none btn btn-sm fs-5 btn-light-danger  btn-flex btn-center btn-active-light-danger ms-2"
                        id="clearbtn" type="button" onClick={(e) => clearAll()}
                      // data-bs-target="#modal_adduser"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4 h-100" id="contentdiv">
                  <div
                    style={{ overflow: 'auto' }} className="d-flex flex-row mw-100 h-100">
                    <table
                      className="table align-middle table-row-dashed fs-6 gy-5 scroll-x w-100"
                      id="questionstable"
                    >
                      <thead>
                        <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
                          <th className="py-0 px-3">#</th>
                          <th className="py-0 px-3 ">ASSESSMENT CODE</th>
                          <th className="py-0 px-3 ">MARKS</th>
                          <th className="py-0 px-3 ">NEGATIVE MARKS</th>
                          <th className="py-0 px-3 ">QUESTION CODE</th>
                          <th className="py-0 px-3 ">QUESTION COMPLEXITY</th>
                          <th className="py-0 px-3 ">QUESTION TYPE</th>
                          <th className="py-0 px-3 ">QUESTION SUBTYPE</th>
                          <th className="py-0 px-3 ">ONLY ASSESSMENT</th>
                          <th className="py-0 px-3 ">LESSON CODES</th>
                          <th className="py-0 px-3 ">QUESTION TEXT</th>
                          <th className="py-0 px-3 ">QUESTION COMPREHENSION</th>
                          <th className="py-0 px-3 ">QUESTION IMAGES</th>
                          <th className="py-0 px-3 ">QUESTION EXPLAINATION</th>
                          <th className="py-0 px-3 ">OPT1 TEXT</th>
                          <th className="py-0 px-3 ">OPT1 IMAGE</th>
                          <th className="py-0 px-3 ">OPT1 ISCORRECT</th>
                          <th className="py-0 px-3 ">OPT2 TEXT</th>
                          <th className="py-0 px-3 ">OPT2 IMAGE</th>
                          <th className="py-0 px-3 ">OPT2 ISCORRECT</th>
                          <th className="py-0 px-3 ">OPT3 TEXT</th>
                          <th className="py-0 px-3 ">OPT3 IMAGE</th>
                          <th className="py-0 px-3 ">OPT3 ISCORRECT</th>
                          <th className="py-0 px-3 ">OPT4 TEXT</th>
                          <th className="py-0 px-3 ">OPT4 IMAGE</th>
                          <th className="py-0 px-3 ">OPT4 ISCORRECT</th>
                        </tr>
                      </thead>

                      <tbody
                        id="questionstablebody"
                        className="fw-semibold text-gray-600"
                      ></tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Questions;
export async function getStaticProps() {
  return {
    props: { module: 'COURSEMASTER', onlyAdminAccess: false },
  };
}
