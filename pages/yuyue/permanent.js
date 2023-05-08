// yuyue/index.js

var util = require('../../utils/time.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    clubName: "",
    floorN: 0,
    rooms: [['101A','101B','102','103','104','105','106','107A','107B','109','110'],
            ['201','202','205','206','207','208','209','211'],
            ['301A','301B','302','304','305','306A','306B','307','308','310','311'],
            ['103/104','105/106','107/108','109/110','111/112','113/114','115'],
            ['201','202','203','204','205','206','207','208','209/210','211/212','213/214','215','216','217'],
            ['301','302','303','304','305','306','307','308','309/310','313/314','315','316','317']],
    weekdays: [1, 2, 3, 4, 5],
    schedulePeriods: [['12:20~13:00','16:00~17:20']],
    years: null,
    months: null,
    dates: null,
    signature: "",
    building: "",
    sRoom: "",
    sMonthIdx: 0,
    sDateIdx: 0,
    scheduleIdx: 0,
    sTimeIdx:0,
    sWeekdayIdx: 0,
    schedule: [],
    bookedDates: [],
    availableDates: [],
    id: "",
    originalCount: 0
  },

  isLeap(year) {
    if (year % 400 == 0)
        return true;
    else {
        if (year % 100 == 0)
            return false;
        else if (year % 4 == 0)
            return true;
        return false;
    }
  },

  async onLoad() { // TODO: cv to index.js
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let dates = [];
    let months = [];
    let years = [];
    let clubName = wx.getStorageSync("clubName");

    // form the months array: 1D array, length 3
    for (let i = 0; i < 3; i++) {
        let tempMonth = (month + i + 1) % 12;
        tempMonth = (tempMonth == 0) ? 12 : tempMonth;
        months.push(tempMonth);
        years.push(year + parseInt((month+i+1-months[i])/12));
    }

    // form the dates array: 2D array, rows = months, columns = dates
    const daysInMonth = [31, this.isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let i = 0; i < 3; i++) {
        dates.push([]);
        for (let j = ((i == 0) ? day : 1); j <= daysInMonth[months[i]-1]; j++)
            dates[i].push(j);
    }
    let building = "ZTB"
    if (wx.getStorageSync('floorN') <= 2){
        building = "XMT"
    }
    this.setData({
        years: years,
        months: months,
        dates: dates,
        clubName: clubName,
        floorN: wx.getStorageSync('floorN'),
        sRoom: this.data.rooms[wx.getStorageSync('floorN')][0],
        building: building
    })
    let selRoom =  this.data.sRoom
    let selWeekday = this.data.weekdays
    // choose all date/month in semester that correspond to the weekday
    let weekdayTime = this.getWeekdayList(selWeekday[this.data.sWeekdayIdx])
    // no need for a permanent_reservations database. List out all reservations directly as normal reservations
    let time = []
    let availableTime = []
    let timeSchedule = this.data.schedulePeriods[0][this.data.scheduleIdx]
    for (let i=0; i < weekdayTime.length; i++) {
        let timePassed = false
        let res = await wx.cloud.database().collection('reservations')
        .where({
            building: this.data.building,
            room: selRoom,
            Date: weekdayTime[i],
            // teacherStatus: {$ne: 0},
            time: timeSchedule
        }).get()
        let date = new Date();
        let YEAR = date.getFullYear()
        let MONTH = parseInt(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let DATE = parseInt(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
        let HOUR = date.getHours();
        let MINUTE = date.getMinutes();
        let tmp = timeSchedule.split("~")
        tmp[0] = tmp[0].split(":")
        tmp[0][0] = parseInt(tmp[0][0])
        tmp[0][1] = parseInt(tmp[0][1])
        tmp[1] = tmp[1].split(":")
        tmp[1][0] = parseInt(tmp[1][0])
        tmp[1][1] = parseInt(tmp[1][1])
        let itemDate = weekdayTime[i].split("/")
        let year = itemDate[2];
        let month = itemDate[0];
        let day = itemDate[1];
        // check if the time is before the event starts
        if (! (year > YEAR ||
            year == YEAR && month > MONTH ||
            year == YEAR && month == MONTH && day > DATE ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] > HOUR ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] == HOUR && tmp[0][1] > MINUTE
            )) {
            timePassed = true;
        }
        // if there is data that has teacher status != 0 (not denied) or it is denied but by the same club
        if (res.data.length > 0) {
            if (res.data[0].teacherStatus != 0 || res.data[0].teacherStatus == 0 && res.data[0].user == wx.getStorageSync('clubName')) { // if already denied or there is some one else's booking application
                time.push(weekdayTime[i])
            }
            else if (timePassed) { // if time has passed
                // time.push(weekdayTime[i])
                continue
            }
            else {
                availableTime.push(weekdayTime[i])
            }
        }
        else if (timePassed) { // if time has passed
            // time.push(weekdayTime[i])
            continue
        }
        else {
            availableTime.push(weekdayTime[i])
        }
        // Get the id of user's club and the number of reservations
        await wx.cloud.database().collection("clubs")
        .where({
            clubName: clubName
        })
        .get()
        .then(res => {
            let data = res.data[0];
            this.setData({
                id: data._id,
                originalCount: data.bookCount
            })
        })
    }
    this.setData({
        bookedDates: time,
        availableDates: availableTime
    })
  },

  async pickerBindChange(e){
    const val = e.detail.value;
    this.setData({
        sRoom: this.data.rooms[this.data.floorN][val[0]],
        sWeekdayIdx: val[1],
        sTimeIdx:val[2],
    })
    let selRoom =  this.data.sRoom
    let selWeekday = this.data.weekdays
    // choose all date/month in semester that correspond to the weekday
    let weekdayTime = this.getWeekdayList(selWeekday[this.data.sWeekdayIdx])
    // no need for a permanent_reservations database. List out all reservations directly as normal reservations
    let time = []
    let availableTime = []
    let timeSchedule = this.data.schedulePeriods[0][this.data.sTimeIdx]
    console.log("timeSchedule", timeSchedule)
    for (let i=0; i < weekdayTime.length; i++) {
        let timePassed = false
        let res = await wx.cloud.database().collection('reservations')
        .where({
            building: this.data.building,
            room: selRoom,
            Date: weekdayTime[i],
            // teacherStatus: {$ne: 0},
            time: timeSchedule
        }).get()
        let date = new Date();
        let YEAR = date.getFullYear()
        let MONTH = parseInt(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let DATE = parseInt(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
        let HOUR = date.getHours();
        let MINUTE = date.getMinutes();
        let tmp = timeSchedule.split("~")
        tmp[0] = tmp[0].split(":")
        tmp[0][0] = parseInt(tmp[0][0])
        tmp[0][1] = parseInt(tmp[0][1])
        tmp[1] = tmp[1].split(":")
        tmp[1][0] = parseInt(tmp[1][0])
        tmp[1][1] = parseInt(tmp[1][1])
        let itemDate = weekdayTime[i].split("/")
        let year = itemDate[2];
        let month = itemDate[0];
        let day = itemDate[1];
        console.log(itemDate, weekdayTime[i], year, month, day, tmp, YEAR, MONTH, DATE, HOUR, MINUTE)
        // check if the time is before the event starts
        if (! (year > YEAR ||
            year == YEAR && month > MONTH ||
            year == YEAR && month == MONTH && day > DATE ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] > HOUR ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] == HOUR && tmp[0][1] > MINUTE
            )) {
            timePassed = true;
        }
        // if there is data that has teacher status != 0 (not denied) or it is denied but by the same club
        if (res.data.length > 0) {
            if (res.data[0].teacherStatus != 0 || res.data[0].teacherStatus == 0 && res.data[0].user == wx.getStorageSync('clubName')) { // if already denied or there is some one else's booking application
                console.log("alreadyDenied and there's someone else's booking application at "+weekdayTime[i])
                time.push(weekdayTime[i])
            }
            else if (timePassed) { // if time has passed
                console.log("time passed for "+weekdayTime[i])
                // time.push(weekdayTime[i])
                continue
            }
            else {
                console.log("available for "+weekdayTime[i])
                availableTime.push(weekdayTime[i])
            }
        }
        else if (timePassed) { // if time has passed
            console.log("time passed for "+weekdayTime[i])
            // time.push(weekdayTime[i])
            continue
        }
        else {
            console.log("available for "+weekdayTime[i])
            availableTime.push(weekdayTime[i])
        }
    }
    this.setData({
        bookedDates: time, // bookedDates meaning dates unavailable (either booked, already denied, or time has passed)
        availableDates: availableTime
    })
  },

  getWeekdayList: function(weekday) {
    var myDate = new Date();
    // let YEAR = myDate.getFullYear(); //获取完整的年份 (2023)
    // let MONTH = myDate.getMonth()+1; //获取当前月份 (1-12)
    // let DATE = myDate.getDate(); //获取当前日 (1-31)
    let WEEKDAY = myDate.getDay()-1; //获取当前星期X (0-6)
    let datesList = []
    let tmp = 0;
    let daysPassed = 0;
    for (let i = 0; i < this.data.months.length; i++) {
        for (let j = 0; j < this.data.dates[i].length; j++) {
            daysPassed++;
            if (weekday < WEEKDAY) 
                tmp = 7+weekday-WEEKDAY
            else
                tmp = weekday-WEEKDAY
            if (daysPassed%7 == tmp) {
                datesList.push(this.data.months[i]+"/"+this.data.dates[i][j]+"/"+this.data.years[i]);
            }
       }
    }
    return datesList;
  },

  signatureBindInput: function(e) {
      const val = e.detail.value;
      this.setData({
        signature: val,
      })
  },

  async booked() {
    // TODO: check if the clubname is valid when booking to prevent sync error
    let selBuilding = this.data.building
    let selRoom =  this.data.sRoom
    let selTime = this.data.schedulePeriods[0][this.data.sTimeIdx]
    let signature = this.data.signature
    let clubN = this.data.clubName
    const originalCount = this.data.originalCount
    let id = this.data.id
    const newCount = this.data.availableDates.length
    const totalCount = originalCount + newCount
    console.log("Original Counts:", originalCount)
    console.log("New Counts:", newCount)
    console.log("Total Counts", originalCount + newCount)
    let res = await wx.cloud.database().collection('clubs').where({
        clubName: clubN
    })
    .get()
    // Check login status & whether the 20-times limit is exceeded
    if (res.data.length > 0 && originalCount + newCount <= 20) {
        if (signature != "") {
            // Add reservations for all available sessions
            for (let i=0; i<this.data.availableDates.length; i++) {
                wx.cloud.database().collection('reservations')
                .add({
                    data:({
                        building: selBuilding,
                        room: selRoom,
                        Date: this.data.availableDates[i],
                        user: clubN,
                        time: selTime,
                        status: 0,
                        teacherStatus: -1,
                        used: null,
                        cleaned: null,
                        rejectReason: "",
                    })
                })
            }
            // If there is no conflicting time schedules
            if (this.data.bookedDates.length == 0) {
                wx.showModal({
                    title: "Success",
                    content: "Upload success!",
                    showCancel: false,
                    success(res) {
                        // Upload the number of reservations
                        wx.cloud.database().collection("clubs")
                        .doc(id)
                        .update({
                            data: {
                                bookCount: totalCount
                            },
                            success: function(res) {
                                console.log("Number of bookings updated", res)
                            }
                        })
                        wx.switchTab({
                            url: '/pages/profile/profile',
                        })
                        console.log("Reserve success");
                    },
                    catch(e) {
                        console.log("Reserve failure", e);
                    }
                })
            }
            // If all sessions are taken
            else if (this.data.availableDates == 0) {
                let content = "Unfortunately, you or someone else has already taken this slot. Please select another time that suits you."
                wx.showModal({
                    title: "Success",
                    content: content,
                    showCancel: false,
                    success(res) {
                        wx.switchTab({
                            url: '/pages/profile/profile',
                        })
                        console.log("Reserve success");
                    },
                    catch(e) {
                        console.log("Reserve failure", e);
                    }
                })
            }
            // else print out the conflicting dates as a notice
            else { 
                let content =  "Upload success! However, some dates cannot be booked due to conflicting time schedules. The available date(s) are: ";
                for (let i = 0; i < this.data.availableDates.length-1; i++) {
                    content += this.data.availableDates[i]+", ";
                }
                content += this.data.availableDates[this.data.availableDates.length-1] + "."
                
                wx.showModal({
                    title: "Success",
                    content: content,
                    showCancel: false,
                    success(res) {
                        // Upload the number of reservations
                        wx.cloud.database().collection("clubs")
                        .doc(id)
                        .update({
                            data: {
                                bookCount: totalCount
                            },
                            success: function(res) {
                                console.log("Number of bookings updated", res)
                            }
                        })
                        wx.switchTab({
                            url: '/pages/profile/profile',
                        })
                        console.log("Reserve success");
                    },
                    catch(e) {
                        console.log("Reserve failure", e);
                    }
                })
            
            }
        } else {
            wx.showModal({
                title: "Warning",
                content: "Please fill in all blanks!",
                showCancel: false,
            })
        }
    }
    else if (res.data.length == 0) {
        wx.showModal({
            title: "Error",
            content: "Your login status has expired. Please login again.",
            showCancel: false,
        })
    }
    // If the 20-times limit is exceeded
    else {
        wx.showModal({
            title: "Limit exceeded",
            content: `Your club has already filed ${originalCount} applications, and filing other applications will exceed quota.`,
            showCancel: false,
            success(res) {
                wx.switchTab({
                    url: "/pages/profile/profile"
                })
            }
        })
    }
    console.log("Available date", this.data.availableDates)
  }
})