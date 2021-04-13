import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  TouchableNativeFeedback,
  StyleSheet,
  ToastAndroid
} from 'react-native'
import OtpInputs from './OTPInputs'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import { Ionicons } from '../Icons/icons'
import { Card, ProgressBar } from 'react-native-paper'
import { f, storage } from '../config/config'
import RNOtpVerify from 'react-native-otp-verify'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Header from '../Components/header'
import firestore from '@react-native-firebase/firestore'
import Loading from '../Components/Loading'
import { requesteid } from '../Components/UniqueCodeGenerators'
import Modal from 'react-native-modal'
import { Primary } from '../Styles/colors'

export default function OTP (props) {
  const firstName = props.navigation.getParam('firstName')
  const lastName = props.navigation.getParam('lastName')
  const email = props.navigation.getParam('Emailid')
  const mobile = props.navigation.getParam('phone')
  const account = props.navigation.getParam('accountType')
  const confirmResult = props.navigation.getParam('confirmResult')
  var seller_id

  var shouldUploadUserData = true

  if (firstName == undefined) {
    shouldUploadUserData = false
  }

  const [code, setCode] = useState('')
  const [otp, setotp] = useState([])
  const [auto, setauto] = useState(false)
  const [process, setprocess] = useState(0)
  const [painterprocess, setpainterprocess] = useState(0)
  const [sellerprocess, setsellerprocess] = useState(0)
  const [sellermodal, setsellermodel] = useState(false)
  const [paintermodal, setpaintermodal] = useState(false)
  const [currentfiletype, setcurrentfiletype] = useState('')
  const [text, settext] = useState('')

  // Step 1 : confirmation of Code
  async function confirmCode () {
    if (account === 'Painter') {
      setpaintermodal(true)
      setpainterprocess(0.05)
    } else if (account === 'Seller') {
      setsellermodel(true)
      setsellerprocess(0.05)
    } else {
      setprocess(2)
    }
    settext('Veryfying')
    try {
      const user = f.auth().currentUser
      if (user) {
        if (shouldUploadUserData === true) {
          await UploadImage()
        } else {
          setprocess(0)
          gotoWaitScreen()
        }
      } else {
        await confirmResult
          .confirm(code)
          .then(async result => {
            if (shouldUploadUserData === true) {
              await UploadImage()
            } else {
              setprocess(0)
              gotoWaitScreen()
            }
          })
          .catch(e => {
            setprocess(0)
            setsellermodel(false)
            setpaintermodal(false)
            setsellerprocess(0)
            setpainterprocess(0)
            alert('Invalid OTP...!')
            console.log(e)
          })
      }
    } catch (error) {
      setprocess(0)
      setsellermodel(false)
      setpaintermodal(false)
      setsellerprocess(0)
      setpainterprocess(0)
      alert('Something Bad Happen try again...!')
      console.log(error)
    }
  }

  // Step 2 : Upload Profile Images
  const UploadImage = async () => {
    if (account === 'Painter') {
      setpainterprocess(0.15)
    } else {
      setsellerprocess(0.25)
    }
    settext('Uploading Profile Image...')
    const PP = props.navigation.getParam('PP')
    const imageid = props.navigation.getParam('imgid')
    var userid = f.auth().currentUser.uid

    console.log('UploadImage')

    var re = /(?:\.([^.]+))?$/
    var ext = re.exec(PP)[1]
    setcurrentfiletype(ext)

    if (account === 'Painter') {
      setpainterprocess(0.25)
    } else {
      setsellerprocess(0.35)
    }

    const response = await fetch(PP)
    const blob = await response.blob()
    var filepath = imageid + '.' + currentfiletype

    const UploadTask = storage
      .ref('Profile_Images_Users/' + userid + '/img')
      .child(filepath)
      .put(blob)

    UploadTask.on(
      'state_changed',
      function (snapshot) {
        var Progres = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0)
      },
      function (error) {
        setprocess(0)
        setsellermodel(false)
        setpaintermodal(false)
        setsellerprocess(0)
        setpainterprocess(0)
        alert(error)
      },
      function () {
        UploadTask.snapshot.ref.getDownloadURL().then(async downloadurl => {
          if (account === 'Painter') {
            setpainterprocess(0.35)
          } else {
            setsellerprocess(0.55)
          }
          await uploadInformation(downloadurl)
        })
      }
    )
  }

  const getSellerId = async () => {
    await f
      .database()
      .ref()
      .child('seller_id')
      .once('value')
      .then(r => {
        seller_id = r.val()
      })
      .catch(e => {})
  }

  const updateSellerIdInFirebase = async () => {
    await f
      .database()
      .ref()
      .child('seller_id')
      .set(seller_id + 1)
      .then(r => {})
      .catch(e => {})
  }

  // Step 3 : Checking Type of user

  const uploadInformation = async uri => {
    if (account === 'Painter') {
      setpainterprocess(0.45)
      settext('Checking...')
    } else {
      setsellerprocess(0.65)
      settext('Checking...')
    }
    let userId = f.auth().currentUser.uid

    if (account === 'Painter') {
      setpainterprocess(0.55)
      settext('Uploading Adhar Card...')
      await UploadPainterAdharCardImage(uri)
    } else {
      setsellerprocess(0.75)
      settext('Generating Seller ID...')
      await getSellerId()

      const data = {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: mobile,
        account: account,
        code: seller_id,
        Profile_Image: uri,
        isApproved: false
      }

      const requestId = requesteid()

      setsellerprocess(0.85)
      settext('Uplading Data....')
      await firestore()
        .collection('Seller_Request')
        .doc(requestId)
        .set({
          SellerID: userId,
          Deny: false
        })

      setsellerprocess(0.95)
      await firestore()
        .collection('users')
        .doc(userId)
        .set(data)
        .then(async r => {
          setsellerprocess(0.99)
          await updateSellerIdInFirebase()
          setsellerprocess(1)
          setsellermodel(false)
          setprocess(0)
          gotoWaitScreen()
        })
        .catch(e => {
          setsellermodel(false)
          setsellerprocess(0)
          alert('Something Bad Happen Try Again')
          setprocess(0)
        })
    }
  }

  // Upload Adhar Card of Painters
  const UploadPainterAdharCardImage = async ProfileImageURI => {
    const Adhar_Card_Image = props.navigation.getParam('Adhar_Card')
    const Adharimgid = props.navigation.getParam('Adharimgid')
    var userid = f.auth().currentUser.uid

    console.log('UploadImageAdhar')

    var re = /(?:\.([^.]+))?$/
    var ext = re.exec(Adhar_Card_Image)[1]

    setpainterprocess(0.65)

    const response = await fetch(Adhar_Card_Image)
    const blob = await response.blob()
    var filepath = Adharimgid + '.' + ext

    const UploadTask = storage
      .ref('Aadhar_Images_Users/' + userid + '/img')
      .child(filepath)
      .put(blob)

    UploadTask.on(
      'state_changed',
      function (snapshot) {
        var Progres = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0)
      },
      function (error) {
        setprocess(0)
        setpaintermodal(false)
        setpainterprocess(0)
        alert(error)
      },
      function () {
        UploadTask.snapshot.ref.getDownloadURL().then(async downloadurl => {
          setpainterprocess(0.75)
          await UploadPainterInfo(ProfileImageURI, downloadurl)
        })
      }
    )
  }

  // Upload Info of Painters
  const UploadPainterInfo = async (ProfileUri, Adhar_Card_Uri) => {
    let userId = f.auth().currentUser.uid
    console.log('Upload info')
    setpainterprocess(0.85)
    settext('Uploading Data...')
    const SellerCode = props.navigation.getParam('SellerCode')
    const SellerID = props.navigation.getParam('SellerId')
    const approved = props.navigation.getParam('isapproved')
    const requestId = requesteid()

    await firestore()
      .collection('Request')
      .doc(requestId)
      .set({
        SellerID: SellerID,
        PainterID: userId,
        Deny: false
      })
    setpainterprocess(0.95)

    const data = {
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: mobile,
      account: account,
      isApproved: approved,
      SellerCode: SellerCode,
      Profile_Image: ProfileUri,
      Adhar_Card_Image: Adhar_Card_Uri,
      wallet: 0
    }

    await firestore()
      .collection('users')
      .doc(userId)
      .set(data)
      .then(r => {
        setprocess(0)
        setpainterprocess(1)
        setpaintermodal(false)
        gotoWaitScreen()
      })
      .catch(e => {
        setpainterprocess(0)
        setpaintermodal(false)
        setprocess(0)
        alert('Something Bad Happen Try Again')
      })
  }

  const gotoWaitScreen = () => {
    props.navigation.navigate('Wait')
  }

  useEffect(() => {
    console.log(firstName)
    if (f.auth.PhoneAuthState.CODE_SENT) {
      ToastAndroid.show('OTP Sent!', ToastAndroid.LONG)
      RNOtpVerify.getOtp()
        .then(p => {
          RNOtpVerify.addListener(message => {
            console.log('Listener Added')
            try {
              if (message && message !== 'Timeout Error') {
                console.log('Message Found', message)
                const otp = new RegExp(/(\d{6})/g.exec(message)[1])
                console.log('OTP Found', otp.source, otp.source.length)
                if (otp.source.length >= 6) {
                  console.log('setting otp...')
                  var otpnumbers = []
                  for (var i = 0; i <= otp.source.length; i++) {
                    var num = otp.source.charAt(i)
                    console.log('Setting', num)
                    otpnumbers[i] = num
                  }
                  setotp(otpnumbers)
                  setauto(true)
                } else {
                  console.log('Not otp...')
                }
              } else {
                console.log(
                  'OTPVerification: RNOtpVerify.getOtp - message=>',
                  message
                )
              }
            } catch (error) {
              console.log('OTPVerification: RNOtpVerify.getOtp error=>', error)
            }
          })
        })
        .catch(error => {
          console.log(error)
        })

      return () => {
        RNOtpVerify.removeListener()
      }
    }
  }, [])

  const setOtp = index => {
    console.log(otp[index])
    return otp[index].toString()
  }

  return (
    <KeyboardAwareScrollView
      enableAutomaticScroll={true}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <View style={styles.container}>
        <View style={styles.ImageBackground}>
          <Header
            Name={'OTP Verification'}
            onPress={() => props.navigation.navigate('Login')}
          />
        </View>

        <View
          style={{
            flex: 1,
            marginTop: -hp('10%'),
            backgroundColor: 'white',
            borderTopLeftRadius: wp('15%')
          }}
        >
          <View
            style={{ flex: 1, marginTop: hp('10%'), backgroundColor: 'white' }}
          >
            <Text
              style={{
                ...styles.title,
                ...{ color: 'black', marginTop: hp('1%') }
              }}
            >
              Enter OTP
            </Text>

            <OtpInputs
              getOtp={setCode}
              autofill={auto}
              setotp={index => setOtp(index)}
            />

            <View style={{ flex: 1 }}>
              <TouchableNativeFeedback onPress={confirmCode}>
                <Card style={styles.button}>
                  <Text style={styles.buttontext}>Submit</Text>
                </Card>
              </TouchableNativeFeedback>
            </View>
          </View>
        </View>

        <Loading isVisible={process > 1} data='Checking' />

        <Modal isVisible={sellermodal} animationIn={'fadeIn'}>
          <View
            style={{
              backgroundColor: 'white',
              height: hp('30%'),
              marginHorizontal: wp('10%'),
              borderRadius: wp('5%'),
              alignItems: 'center'
            }}
          >
            <Image
              source={require('../../assets/Logo.png')}
              style={{
                height: hp('5%'),
                width: hp('5%'),
                resizeMode: 'contain',
                marginTop: hp('4%')
              }}
            />
            <ProgressBar
              progress={sellerprocess}
              color={Primary}
              style={{
                height: hp('3%'),
                width: wp('65%'),
                marginTop: hp('3%'),
                borderRadius: wp('5%')
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                marginTop: hp('5%'),
                fontSize: hp('2%'),
                color: 'black'
              }}
            >
              {text}...
            </Text>
          </View>
        </Modal>

        <Modal isVisible={paintermodal} animationIn={'fadeIn'}>
          <View
            style={{
              backgroundColor: 'white',
              height: hp('30%'),
              marginHorizontal: wp('10%'),
              borderRadius: wp('5%'),
              alignItems: 'center'
            }}
          >
            <Image
              source={require('../../assets/Logo.png')}
              style={{
                height: hp('5%'),
                width: hp('5%'),
                resizeMode: 'contain',
                marginTop: hp('4%')
              }}
            />
            <ProgressBar
              progress={painterprocess}
              color={Primary}
              style={{
                height: hp('3%'),
                width: wp('65%'),
                marginTop: hp('3%'),
                borderRadius: wp('5%')
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                marginTop: hp('5%'),
                fontSize: hp('2%'),
                color: 'black'
              }}
            >
              {text}...
            </Text>
          </View>
        </Modal>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  ImageBackground: {
    height: hp('30%'),
    width: wp('100%')
  },
  title: {
    color: '#C6C7CB',
    fontSize: hp('2.5%'),
    marginTop: hp('5%'),
    textAlign: 'center',
    marginLeft: -wp('5%'),
    fontWeight: 'bold'
  },
  icon: {
    marginLeft: wp('5%'),
    marginTop: wp('8%')
  },
  button: {
    height: hp('7%'),
    width: wp('40%'),
    marginVertical: hp('2%'),
    alignItems: 'center',
    backgroundColor: '#702f8b',
    borderRadius: wp('5%'),
    alignSelf: 'center',
    elevation: 10
  },
  buttontext: {
    color: 'white',
    fontSize: hp('3%'),
    marginTop: hp('1%')
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  }
})
