// yuyue/index.js

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
    schedulePeriods: [['12:20~13:00','16:00~17:20']],
    years: null,
    months: null,
    dates: null,
    signature: "",
    building: "",
    sRoom: "101A",
    sMonthIdx: 0,
    sDateIdx: 0,
    scheduleIdx: 0,
    sTimeIdx:0,
    schedule:[],
    originalCount: 0,
    id: ""
  },

  // boolean: true = is leap year
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

  async onLoad(option) {
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
    // check if the date is a weekend
    for (let i = 0; i < months.length; i++) {
        for (let j = 0; j < dates[i].length; j++) {
            let myDate = new Date(years[i]+"/"+months[i]+"/"+dates[i][j]);
            let myWeekday = myDate.getDay();
            if (myWeekday == 6 || myWeekday == 0) {
                dates[i].splice(j, 1);
                j--;
            }
        }
    }
    // building
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
    let selYear = this.data.years[this.data.sMonthIdx]
    let selMonth = this.data.months[this.data.sMonthIdx]
    let selDay = this.data.dates[this.data.sMonthIdx][this.data.sDateIdx]
    let schedule = this.data.schedulePeriods
    let sch = schedule[this.data.scheduleIdx]
    let time = JSON.parse(JSON.stringify(sch));
    for (let i = 0; i < sch.length; i++) {
        let alreadyDenied = false
        let pendingOrAccepted = false
        let timePassed = false
        await wx.cloud.database().collection('reservations')
        .where({
            building: this.data.building,
            room: selRoom,
            Date: selMonth + "/" + selDay + "/" + selYear,
            time: sch[i],
            // teacherStatus: {$ne: 0}
        })
        .get()
        .then(res => {
            // check if you have already filed an application to the same date and was denied
            let list = res.data
            list.forEach(function (item, index) {
                if (item.teacherStatus == 0 && item.user == wx.getStorageSync('clubName')) {
                    alreadyDenied = true;
                }
                else if (item.teacherStatus != 0) {
                    pendingOrAccepted = true;
                }
            });
        })
        .catch(err => {
            console.log("picker change fail",err)
        })
        let date = new Date();
        let YEAR = date.getFullYear()
        let MONTH = parseInt(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let DATE = parseInt(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
        let HOUR = date.getHours();
        let MINUTE = date.getMinutes();
        let tmp = sch[i].split("~")
        tmp[0] = tmp[0].split(":")
        tmp[0][0] = parseInt(tmp[0][0])
        tmp[0][1] = parseInt(tmp[0][1])
        tmp[1] = tmp[1].split(":")
        tmp[1][0] = parseInt(tmp[1][0])
        tmp[1][1] = parseInt(tmp[1][1])
        let year = selYear;
        let month = selMonth;
        let day = selDay;
        // check if the time is before the event starts
        if (! (year > YEAR ||
            year == YEAR && month > MONTH ||
            year == YEAR && month == MONTH && day > DATE ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] > HOUR ||
            year == YEAR && month == MONTH && day == DATE && tmp[0][0] == HOUR && tmp[0][1] > MINUTE
            )) {
            timePassed = true;
        }
        if (alreadyDenied || pendingOrAccepted || timePassed) {
            // remove the time from time schedule
            time.splice(i, 1);
            i--;
        }
    }
    setTimeout(() => {
        this.setData({
            schedule: time
        })
    }, 200);
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
  },

    async pickerBindChange(e){
        const val = e.detail.value;
        this.setData({
            sRoom: this.data.rooms[this.data.floorN][val[0]],
            sMonthIdx: val[1],
            sDateIdx: val[2],
            scheduleIdx: this.findSchedulePeriodIdx(this.data.years[val[1]], this.data.months[val[1]], this.data.dates[val[2]]),
            sTimeIdx:val[3],
        })
        let clubName = wx.getStorageSync("clubName");
        let selRoom =  this.data.sRoom
        let selYear = this.data.years[this.data.sMonthIdx]
        let selMonth = this.data.months[this.data.sMonthIdx]
        let selDay = this.data.dates[this.data.sMonthIdx][this.data.sDateIdx]
        let schedule = this.data.schedulePeriods
        let sch = schedule[this.data.scheduleIdx]
        let time = JSON.parse(JSON.stringify(sch));
        let i = 0;
        while (i < sch.length) {
            console.log(i, "here1")
            let alreadyDenied = false
            let pendingOrAccepted = false
            let timePassed = false
            await wx.cloud.database().collection('reservations')
            .where({
                building: this.data.building,
                room: selRoom,
                Date: selMonth + "/" + selDay + "/" + selYear,
                time: sch[i],
                // teacherStatus: {$ne: 0}
            })
            .get()
            .then(res => {
                // check if you have already filed an application to the same date and was denied
                let list = res.data
                list.forEach(function (item, index) {
                    if (item.teacherStatus == 0 && item.user == wx.getStorageSync('clubName')) {
                        alreadyDenied = true;
                    }
                    else if (item.teacherStatus != 0) {
                        pendingOrAccepted = true;
                    }
                });
            })
            .catch(err => {
                console.log("picker change fail",err)
            })
            let date = new Date();
            let YEAR = date.getFullYear()
            let MONTH = parseInt(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
            let DATE = parseInt(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
            let HOUR = date.getHours();
            let MINUTE = date.getMinutes();
            let tmp = sch[i].split("~")
            tmp[0] = tmp[0].split(":")
            tmp[0][0] = parseInt(tmp[0][0])
            tmp[0][1] = parseInt(tmp[0][1])
            tmp[1] = tmp[1].split(":")
            tmp[1][0] = parseInt(tmp[1][0])
            tmp[1][1] = parseInt(tmp[1][1])
            let year = selYear;
            let month = selMonth;
            let day = selDay;
            // check if the time is before the event starts
            if (! (year > YEAR ||
                year == YEAR && month > MONTH ||
                year == YEAR && month == MONTH && day > DATE ||
                year == YEAR && month == MONTH && day == DATE && tmp[0][0] > HOUR ||
                year == YEAR && month == MONTH && day == DATE && tmp[0][0] == HOUR && tmp[0][1] > MINUTE
                )) {
                timePassed = true;
            }
            if (alreadyDenied || pendingOrAccepted || timePassed) {
                // bug
                console.log(i, "here2")
                // remove the time from time schedule
                time.splice(i, 1);
                i--;
                console.log(i, "here3")
            }
            console.log(time, sch[i], i, "here")
            i++;
            console.log(i, "here4")
        }
        setTimeout(() => {
            this.setData({
                schedule: time
            })
        }, 200);
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
    },

  findDay: function(year, month, date) {
    let tempDate = new Date(year, month, date);
    return tempDate.getDay();
  },

  findSchedulePeriodIdx: function(year, month, date) {
    let tempDay = this.findDay(year, month, date);
    if (tempDay == 4)
        return 1;
    else
        return 0;
  },

  signatureBindInput: function(e) {
      const val = e.detail.value;
      this.setData({
        signature: val,
      })
  },

  async booked(){
    let selBuilding = this.data.building
    let selRoom =  this.data.sRoom
    let selMonth = this.data.months[this.data.sMonthIdx]
    let selDay = this.data.dates[this.data.sMonthIdx][this.data.sDateIdx]
    let selTime = this.data.schedule[this.data.sTimeIdx]
    console.log(selTime)
    let signature = this.data.signature
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    let year = date.getFullYear();
    let clubN = this.data.clubName
    let originalCount = this.data.originalCount
    let id = this.data.id
    console.log("Original count", originalCount)
    let res = await wx.cloud.database().collection('clubs').where({
        clubName: clubN
    })
    .get()
    if (res.data.length > 0) {
        if (signature != "" && selTime != "" && originalCount < 20) {
            wx.cloud.database().collection('reservations')
            .add({
                data:({
                    building: selBuilding,
                    room: selRoom,
                    Date: selMonth + "/" + selDay + "/" + year,
                    user: this.data.clubName,
                    time: selTime,
                    status: 0,
                    teacherStatus: -1,
                    used: null,
                    cleaned: null,
                    rejectReason: "",
                })
            })
            .then(res => {
                console.log("booking saved",res)
                // Update the number of reservations
                originalCount += 1
                wx.cloud.database().collection("clubs")
                .doc(id)
                .update({
                    data: {
                        bookCount: originalCount
                    },
                    success: function(res) {
                        console.log("Number of bookings updated", res)
                    },
                    fail: function(e) {
                        console.log("Update failed", e)
                    }
                })
            })
            .catch(err => {
                console.log("booking error",err)
            })
            wx.showModal({
                title: "Success",
                content: "Upload success!",
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
        // Check whether the user has already made 20 bookings
        else if (originalCount >= 20){
            wx.showModal({
                title: "Limit exceeded",
                content: "Your club has already filed 20 applications, and filling another application will exceed quota.",
                showCancel: false,
                success: function(res) {
                    wx.switchTab({
                        url: '/pages/profile/profile',
                    })
                }
            })
        } 
        else {
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
  }
})