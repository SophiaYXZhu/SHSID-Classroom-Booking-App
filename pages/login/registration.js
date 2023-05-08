// pages/login/registration.js

const app = getApp();



Page({
    /**
     * 页面的初始数据
     */
    data: {
        cnName: "",
        clubName: "",
        teacherName: "",
        signature: "",
        gNum: "",
        pwd: "",
        pwdConfirm: "",
        email: "",
        class: "",
    },

    bindInputCnName: function(e) {
        const val = e.detail.value;
        this.setData({
            cnName: val,
        })
    },

    bindInputClubName: function(e) {
        const val = e.detail.value;
        this.setData({
            clubName: val,
        })
    },

    bindInputTeacherName: function(e) {
        const val = e.detail.value;
        this.setData({
            teacherName: val,
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
        pwd: val,
    })
  },

  bindInputPasswordConfirm: function(e) {
    const val = e.detail.value;
    this.setData({
        pwdConfirm: val,
    })
  },

  inputEmail: function(e) {
      const val = e.detail.value;
      this.setData({
          email: val,
      })
  },

  inputClass: function(e) {
    const val = e.detail.value;
    this.setData({
        class: val,
    })
  },

  validateEmail(email) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true
    }
    return false
  },

  validateClass(Class) {
    if ((Class.indexOf("-") == 1 || Class.indexOf("-") == 2) && Class.lastIndexOf("-") == Class.indexOf("-")) {
        Class = Class.split("-")
        if (parseInt(Class[0]) != NaN && parseInt(Class[1]) != NaN) {
            Class[0] = parseInt(Class[0])
            Class[1] = parseInt(Class[1])
            if (Class[0] >= 9 && Class[0] <= 12 && Class[1] >= 1 && Class[1] <= 12) {
                return true
            }
            return false
        }
        return false
    }
    return false
  },

  async onBindSubmit(e) {
    const db = wx.cloud.database();
    const cnNameVal = this.data.cnName.trim();
    const clubNameVal = this.data.clubName.trim();
    const teacherNameVal = this.data.teacherName.trim();
    const signatureVal = this.data.signature.trim();
    const pwdVal = this.data.pwd.trim();
    const pwdConfirmVal = this.data.pwdConfirm.trim();
    const emailVal = this.data.email.trim();
    const classVal = this.data.class.trim();
    let pwdCorrect = false;
    let boxFilled = true;
    let alreadyRegistered = false;
    let emailValid = false;
    let classValid = false;
    if (pwdVal == pwdConfirmVal) {
        pwdCorrect = true;
    }
    if (cnNameVal == "" || signatureVal == "" || clubNameVal == "" || teacherNameVal == "" || pwdVal == "" || emailVal == "" || classVal == "") {
        boxFilled = false;
    }
    // if clubName already exists in database
    let res = await db.collection("clubs").where({
        clubName: clubNameVal
    })
    .get()
    if (res.data.length > 0) {
        alreadyRegistered = true
    }
    // email validation
    if (this.validateEmail(emailVal)) {
        emailValid = true
    }
    // class validation
    if (this.validateClass(classVal)) {
        classValid = true
    }
    if (pwdCorrect && boxFilled && ! alreadyRegistered && emailValid && classValid) {
        wx.showModal({
            title: "Success",
            content: "Upload success",
            showCancel: false,
            success(res) {
                if (res.confirm) {
                    db.collection("clubs")
                    .add({
                        data:({
                            leaderName: cnNameVal,
                            clubName: clubNameVal,
                            teacherName: teacherNameVal,
                            password: pwdVal,
                            email: emailVal,
                            class: classVal,
                            status: -1,
                            suspendReason: "",
                            bookCount: 0
                        }),
                    })
                    .then(res => {
                        console.log("Upload success", res);
                    })
                    .catch(e => {
                        console.log("Upload error", e);
                    })
                    wx.navigateBack();
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
    else if (! boxFilled) {
        wx.showModal({
            title: "Warning",
            content: "Please fill in all boxes",
            showCancel: false,
        })
    }
    else if (alreadyRegistered) {
        wx.showModal({
            title: "Warning",
            content: "Your clubname has already been registered.",
            showCancel: false,
        })
    }
    else if (! emailValid) {
        wx.showModal({
            title: "Warning",
            content: "Please enter a valid email address.",
            showCancel: false,
        })
    }
    else if (! classValid) {
        wx.showModal({
            title: "Warning",
            content: "Please enter a valid grade and class in the instructed format.",
            showCancel: false,
        })
    }
  }

})