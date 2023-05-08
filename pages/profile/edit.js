// pages/profile/edit.js

const app = getApp();


Page({
    /**
     * 页面的初始数据
     */
    data: {
        id: "",
        nCnName: "",
        nClubName: "",
        nTeacherName: "",
        nPwd: "",
        nPwdConfirm: "",
        nEmail: "",
        nClass: "",
        oCnName: "",
        oClubName: "",
        oTeacherName: "",
        oPwd: "",
        oEmail: "",
        oClass: "",
        signature: "",
    },

    async onLoad(options) {
        let clubName = wx.getStorageSync('clubName')
        this.setData({
            oClubName: clubName,
            nClubName: clubName
        })
        let cnName, teacherName, pwd, email, Class, id = null
        await wx.cloud.database().collection("clubs")
        .where({
            clubName: clubName
        })
        .get()
        .then(res => {
            let list = res.data;
            list.forEach(function (item, index) {
                cnName = item.leaderName;
                pwd = item.password;
                teacherName = item.teacherName;
                email = item.email;
                Class = item.class;
                id = item._id;
            })
        })
        this.setData({
            oCnName: cnName,
            oEmail: email,
            oClass: Class,
            oPwd: pwd,
            oTeacherName: teacherName,
            nCnName: cnName,
            nEmail: email,
            nClass: Class,
            nPwd: pwd,
            nTeacherName: teacherName,
            id: id
        })
    },

    bindInputCnName: function(e) {
        const val = e.detail.value;
        this.setData({
            nCnName: val,
        })
    },

    bindInputClubName: function(e) {
        const val = e.detail.value;
        this.setData({
            nClubName: val,
        })
    },

    bindInputTeacherName: function(e) {
        const val = e.detail.value;
        this.setData({
            nTeacherName: val,
        })
    },

    bindInputSignature: function(e) {
        const val = e.detail.value;
        this.setData({
            signature: val,
        })
    },

  bindInputPassword: function(e) {
    const val = e.detail.value;
    this.setData({
        nPwd: val,
    })
  },

  bindInputPasswordConfirm: function(e) {
    const val = e.detail.value;
    this.setData({
        nPwdConfirm: val,
    })
  },

  inputEmail: function(e) {
      const val = e.detail.value;
      this.setData({
          nEmail: val,
      })
  },

  inputClass: function(e) {
    const val = e.detail.value;
    this.setData({
        nClass: val,
    })
  },

  onBindSubmit: function(e) {
    const db = wx.cloud.database();
    const cnNameVal = this.data.nCnName;
    const clubNameVal = this.data.nClubName;
    const teacherNameVal = this.data.nTeacherName;
    const signatureVal = this.data.nSignature;
    const pwdVal = this.data.nPwd;
    const pwdConfirmVal = this.data.nPwdConfirm;
    const emailVal = this.data.nEmail;
    const classVal = this.data.nClass;
    const id = this.data.id;
    let pwdCorrect = false;
    let boxFilled = true;
    if (pwdVal == pwdConfirmVal) {
        pwdCorrect = true;
    }
    if (cnNameVal == "" || signatureVal == "" || clubNameVal == "" || teacherNameVal == "" || pwdVal == "" || emailVal == "" || classVal == "") {
        boxFilled = false;
    }
    if (pwdCorrect && boxFilled) {
        wx.showModal({
            title: "Success",
            showCancel: false,
            content: "Upload success",
            success(res) {
                if (res.confirm) {
                    console.log(id)
                    console.log(db.collection("clubs"))
                    db.collection("clubs")
                    .doc(id)
                    .update({
                        data: ({
                            leaderName: cnNameVal,
                            clubName: clubNameVal,
                            teacherName: teacherNameVal,
                            password: pwdVal,
                            email: emailVal,
                            class: classVal,
                        }),
                        success: function(res) {
                            // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                            console.log(res)
                        }
                    })
                    wx.navigateBack({
                        delta: 1,
                        success: function (e) {
                            var page = getCurrentPages().pop();
                            if (page == undefined || page == null) return;
                            page.onShow();
                        }
                    })
                }
            }
        })
    }
    else if (!pwdCorrect) {
        wx.showModal({
            title: "Warning",
            content: "Password is not the same",
            showCancel: false,
        })
    }
    else {
        wx.showModal({
            title: "Warning",
            content: "Please fill in all boxes",
            showCancel: false,
        })
    }
    
  }

})