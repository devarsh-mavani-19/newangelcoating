import React, { useState, useEffect } from 'react'
import { View, Text, Linking, Alert, ToastAndroid } from 'react-native'
import Header from '../Components/mainHeader'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { RNCamera } from 'react-native-camera'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { Primary } from '../Styles/colors'
import { f } from '../config/config'
import { main } from '../Styles/main'
import Loading from '../Components/Loading'
import { generateRandomCode } from '../Components/UniqueCodeGenerators'
import Confirmation from '../Components/Confirmation'

//important status code (0 = used, 1 = not used, 2 = pending approval)

export default function Scan () {
  const [shouldCheckValueInDatabase, setShouldCheckValueInDatabase] = useState(
    true
  )
  const [userInfo, setUserInfo] = useState({})
  const [loading, setLoading] = useState(false)
  const [uid, setUid] = useState('')
  const [QRInfo, setQRInfo] = useState({})
  const [showConfirmationModal, setShowConfirmationModal] = useState()
  var qrdata

  const initiateRequest = async () => {
    let uniqueCode = generateRandomCode('Qr_Request-')
    await f
      .firestore()
      .collection('qr_requests')
      .doc(`${uniqueCode}`)
      .set({
        user: uid,
        ...QRInfo,
        status: 2,
        timestamp: Date.now(),
        fName: userInfo['firstName'],
        lName: userInfo['lastName'],
        sellerCode: `${userInfo['SellerCode']}`
      })
      .then(async r => {
        await f
          .database()
          .ref()
          .child('qrcodes')
          .child(`${QRInfo['id']}`)
          .set({
            amount: QRInfo['amount'],
            status: 2
          })
          .then(r => {
            ToastAndroid.show('Request Send', ToastAndroid.LONG)
          })
          .catch(e => {
            alert('Something Bad Happend')
          })
      })
      .catch(e => {
        console.log(e)
        alert('Something Bad Happend')
      })
  }

  useEffect(() => {
    setLoading(true)
    setUid(f.auth().currentUser.uid)
    f.firestore()
      .collection('users')
      .doc(f.auth().currentUser.uid)
      .get()
      .then(r => {
        setUserInfo(r.data())
        setLoading(false)
      })
      .catch(e => {
        alert("something wen't wrong")
        setLoading(false)
      })
  }, [])

  const onSuccess = async e => {
    //check the value in database
    setShouldCheckValueInDatabase(false)
    //show dialog
    setLoading(true)

    checkQrCode(e.data)
      .then(r => {
        console.log('console log ', r)
        qrdata = r
        setLoading(false)
        if (qrdata.status == 0 || qrdata.status == 3) {
          //already used
          alert('QR Code already used')
        } else if (qrdata.status == 2) {
          alert('QR Code request is waiting for approval')
        } else {
          setShowConfirmationModal(true)
          // Alert.alert(
          //   'Initiate Request?',
          //   `The Scanned Code is ${e.data} and amount is ${r.amount}. Do you want to continue?`,
          //   [
          //     {
          //       text: 'yes',
          //       style: { color: main.buttonStyle },
          //       onPress: function () {
          //         console.log('Qr info is ', QRInfo)
          //         setShouldCheckValueInDatabase(true)
          //         initiateRequest()
          //       }
          //     },
          //     {
          //       text: 'No',
          //       style: { color: main.buttonStyleCancel },
          //       onPress: function () {
          //         setShouldCheckValueInDatabase(true)
          //       }
          //     }
          //   ]
          // )
        }
      })
      .catch(e => {
        console.log(e)
        setShouldCheckValueInDatabase(true)
        setLoading(false)
      })
  }

  const checkQrCode = async value => {
    let obj = {}
    return new Promise((resolve, reject) => {
      f.database()
        .ref()
        .child('qrcodes')
        .child(value)
        .once('value')
        .then(r => {
          if (r && r != null && r.exists() && r.val() && r.val() != undefined) {
            setQRInfo({
              ...r.val(),
              id: r.key
            })
            resolve({
              ...r.val(),
              id: r.key
            })
          } else {
            setQRInfo({})
            alert('Code Invalid')
            obj = {}
            reject('')
          }
        })
        .catch(e => {
          setQRInfo({})
          alert('Something bad happend')
          reject('')
        })
    })
  }

  return (
    <View>
      <Text
        style={{
          textAlign: 'center',
          marginTop: hp('5%'),
          color: 'black',
          fontWeight: 'bold',
          fontSize: hp('4%')
        }}
      >
        Scan QR Code
      </Text>

      <Loading isVisible={loading} data='Veryfying' />

      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.on}
        fadeIn={false}
        containerStyle={{
          marginTop: hp('5%'),
          marginHorizontal: wp('5%')
        }}
        cameraStyle={{
          height: hp('50%'),
          overflow: 'hidden',
          borderRadius: wp('7%'),
          borderWidth: 1,
          borderColor: Primary
        }}
        reactivate={true}
        reactivateTimeout={3000}
      />

      <Confirmation
        isVisible={showConfirmationModal}
        question={`The Scanned Code is ${QRInfo['id']} and amount is ${QRInfo['amount']}. Do you want to continue?`}
        onPressNo={() => {
          setShowConfirmationModal(false)
        }}
        onPressYes={() => {
          setShowConfirmationModal(false)
          setShouldCheckValueInDatabase(true)
          initiateRequest()
        }}
      />
    </View>
  )
}
