import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, ToastAndroid, Alert, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { Card, Button } from 'react-native-paper'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from '../Icons/icons'
import { Gray, Primary, secondary } from '../Styles/colors'
import { main } from '../Styles/main'
import BankDetailsForm from './BankDetailsForm'
import { auth, f, firestore, timestamp } from '../config/config'
import LoadingBar from '../Components/Loading'
import DataLoader from '../Components/DataLoader'
import { validateIFSC } from '../Constants/validateIFSC'
import { set } from 'react-native-reanimated'
import { generateRandomCode } from '../Components/UniqueCodeGenerators'
import Confirmation from './Confirmation'
import OTPVerification from './OTPVerification'

export default function Widthraw (props) {
  const [showBankDetailsForm, setShowBankDetailsForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)

  const [userInfo, setUserInfo] = useState({})
  const [currentUser, setCurrentUser] = useState('')

  const [shouldShowBankInfo, setShouldShowBankInfo] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const [confirmResult, setConfirmResult] = useState()
  const [isOtpSent, setIsOtpSent] = useState(false)

  var parent = this

  useEffect(() => {
    setInitializing(true)
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    setCurrentUser(auth.currentUser.uid)

    await firestore
      .collection('users')
      .doc(auth.currentUser.uid)
      .get()
      .then(r => {
        if (r && r.exists && r.data()) {
          let data = r.data()
          setUserInfo({
            ...data
          })
          if (data['IFSC'] && data['IFSC'] != undefined) {
            setShouldShowBankInfo(true)
          } else {
            setShouldShowBankInfo(false)
          }
        }
        setInitializing(false)
      })
      .catch(e => {
        setInitializing(false)
      })
  }

  const sendOtp = () => {
    setLoading(true)
    let p = f.auth().currentUser.phoneNumber
    console.log('phone = ', p)
    f.auth()
      .signInWithPhoneNumber(p, true)
      .then(r => {
        // setprocess(0)
        setConfirmResult(r)
        setIsOtpSent(true)
        setLoading(false)

        // props.navigation.navigate({
        //   routeName: 'PainterOTP',
        //   params: {
        //     confirmResult: r,
        //     onOtpVerified: function () {
        //       console.log('OTP Verified')
        //       redeem_cash()
        //     }
        //   }
        // })
      })
      .catch(e => {
        // setprocess(0)
        alert('Something Bad Happen! please try after hour')
        console.log(e)
      })
  }

  const redeem_cash = async () => {
    setLoading(true)
    getPreviousRequest()
      .then(r => {
        if (r.exist) {
          //previous exist
          alert('previous request already pending')
          setLoading(false)
        } else {
          //previous does not exist
          firestore
            .collection(`withdrawrequests`)
            .doc(`${generateRandomCode('WITHDRAW_')}`)
            .set({
              status: 2,
              user: userInfo['userId'],
              amount: userInfo['amount'] == undefined ? 0 : userInfo['amount'],
              timestamp: Date.now()
            })
            .then(r => {
              setLoading(false)
              ToastAndroid.show('Transaction Requested', ToastAndroid.LONG)
            })
            .catch(e => {
              setLoading(false)
              alert('Something Bad Happend')
            })
        }
      })
      .catch(e => {
        setLoading(false)
        console.log('catch')
        alert('something went wrong')
      })
  }

  const getPreviousRequest = () => {
    return new Promise((resolve, reject) => {
      firestore
        .collection('withdrawrequests')
        .where('user', '==', userInfo['userId'])
        .get()
        .then(r => {
          if (r && !r.empty) {
            if (r.docs.length == 0) {
              //no previous request was made
              resolve({ exist: false })
            } else {
              //previously request was made
              //now check if request status is pending
              let isPending = false
              let pendingIndex = -1
              r.docs.forEach((doc, index) => {
                if (doc.data()['status'] == 2) {
                  //pending
                  pendingIndex = index
                  isPending = true
                }
              })
              if (isPending)
                resolve({ exist: true, withdraw_id: r.docs[pendingIndex].id })
              else resolve({ exist: false })
            }
          } else {
            console.log('empty')
            resolve({ exist: false })
          }
        })
        .catch(e => {
          console.log('erro = ', e)
          reject('')
        })
    })
  }

  const on_reddem_cash = () => {
    if (shouldShowBankInfo) {
      // bank information is already entered
      //2 choice : 1 continue or 2 edit bank information
      setShowConfirmationModal(true)
      // Alert.alert(
      //   'Confirm Proceed?',
      //   'Do you want to proceed with saved Bank Information?',
      //   [
      //     {
      //       text: 'Yes, Withdraw Cash',
      //       onPress: () => {
      //         redeem_cash()
      //       }
      //     },
      //     {
      //       text: 'No Cancel Withdrawl',
      //       onPress: () => {}
      //     },
      //     {
      //       text: 'Edit Bank Information',
      //       onPress: () => {
      //         setShowBankDetailsForm(true)
      //       }
      //     }
      //   ]
      // )
    } else {
      //bank information not entered
      alert('Please Fill the account information to proceed')
    }
  }

  const updateBankInformation = async (
    IFSC,
    accountHolderName,
    branchName,
    accNo,
    bankName
  ) => {
    if (
      IFSC == userInfo['IFSC'] &&
      accountHolderName == userInfo['accountHolderName'] &&
      branchName == userInfo['branchName'] &&
      accNo == userInfo['accNo'] &&
      bankName == userInfo['bankName']
    ) {
      alert('Information already up to date')
    } else if (
      IFSC != undefined &&
      accountHolderName != undefined &&
      branchName != undefined &&
      (accNo != undefined) & (bankName != undefined)
    ) {
      if (
        IFSC != '' &&
        accountHolderName != '' &&
        branchName != '' &&
        accNo != '' &&
        bankName != ''
      ) {
        if (validateIFSC(IFSC)) {
          const newData = {
            ...userInfo,
            IFSC: IFSC,
            accountHolderName: accountHolderName,
            branchName: branchName,
            accNo: accNo,
            bankName: bankName
          }
          await firestore
            .collection('users')
            .doc(currentUser)
            .update(newData)
            .then(r => {
              ToastAndroid.show('Updated', ToastAndroid.LONG)
              setUserInfo(newData)
              setShouldShowBankInfo(true)
            })
            .catch(e => {
              console.log(e)
              alert('Something Went Wrong')
            })
          setShowBankDetailsForm(false)
        } else {
          alert('Invalid IFSC')
        }
      } else {
        alert('Please Enter All Information')
      }
    } else {
      alert('Please Enter All Information')
    }
  }

  return showBankDetailsForm ? (
    <BankDetailsForm
      userInfo={userInfo}
      onSaveInfo={updateBankInformation}
      visible={showBankDetailsForm}
      onBackPressed={setShowBankDetailsForm}
    />
  ) : (
    <View style={{ flex: 1 }}>
      <Header Name={'Home'} />
      {initializing ? (
        <DataLoader style={{ flex: 1 }} />
      ) : isOtpSent ? (
        <OTPVerification
          confirmResult={confirmResult}
          onOtpVerified={otpstatus => {
            setIsOtpSent(false)
            setConfirmResult(null)
            if (otpstatus.isValid) {
              redeem_cash()
            }
          }}
        />
      ) : (
        <ScrollView style={{ flexDirection: 'column' }}>
          <View>
            <LoadingBar isVisible={loading} data={'Loading'} />
            <Confirmation
              isVisible={showConfirmationModal}
              question={`Do you want to proceed with saved bank information?`}
              onPressNo={() => {
                setShowConfirmationModal(false)
              }}
              onPressYes={() => {
                setShowConfirmationModal(false)
                sendOtp()

                // setShouldCheckValueInDatabase(true)
                // initiateRequest()
              }}
              onPressNeutral={() => {
                setShowBankDetailsForm(true)
                setShowConfirmationModal(false)
              }}
            />
            <Card
              style={{
                height: hp('25%'),
                marginHorizontal: wp('3%'),
                marginTop: hp('3%'),
                borderRadius: wp('5%'),
                elevation: 5
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: hp('2%'),
                    marginHorizontal: wp('5%')
                  }}
                >
                  <FontAwesome5
                    name='wallet'
                    size={hp('4%')}
                    color={secondary}
                    style={{ marginRight: wp('3%'), marginTop: hp('1%') }}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      marginTop: hp('1.5%'),
                      fontSize: hp('2.5%'),
                      color: 'black',
                      fontWeight: 'bold'
                    }}
                  >
                    WALLET
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: 'center', marginTop: hp('5%') }}>
                <View style={{ flexDirection: 'row' }}>
                  <FontAwesome name='rupee' size={hp('4.5%')} color={Primary} />
                  <Text
                    style={{
                      color: Primary,
                      fontSize: hp('5%'),
                      marginLeft: wp('2%'),
                      marginTop: -hp('1.5%'),
                      fontWeight: 'bold'
                    }}
                  >
                    {userInfo['wallet'] && userInfo['wallet'] != undefined
                      ? userInfo['wallet']
                      : 0}
                  </Text>
                </View>
              </View>
            </Card>
            <Button
              style={{ ...main.buttonStyle }}
              labelStyle={{
                color: 'white',
                fontSize: hp('1.9%')
              }}
              onPress={() => {
                on_reddem_cash()
              }}
            >
              Reddem Cash
            </Button>

            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: hp('2%'),
                  marginHorizontal: wp('5%')
                }}
              >
                <FontAwesome
                  name='bank'
                  size={hp('4%')}
                  color={secondary}
                  style={{ marginRight: wp('3%'), marginTop: hp('1%') }}
                />
                <Text
                  style={{
                    textAlign: 'center',
                    marginTop: hp('1.5%'),
                    fontSize: hp('2.5%'),
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                >
                  Your Bank Information
                </Text>
              </View>
            </View>
            {shouldShowBankInfo ? (
              <Card
                style={{
                  height: hp('60%'),
                  marginHorizontal: wp('3%'),
                  marginTop: hp('3%'),
                  borderRadius: wp('5%'),
                  elevation: 5
                }}
              >
                <View style={{ marginTop: hp('4%') }}>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* <MaterialIcons
                    name='confirmation-number'
                    size={hp('4%')}
                    color={Primary}
                    style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}
                  /> */}
                      <Text
                        style={{ ...main.content, marginTop: hp('2%') }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {'IFSC Code:-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...main.content,
                        marginTop: hp('2%'),
                        alignSelf: 'flex-start',
                        fontWeight: 'bold'
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {userInfo['IFSC']}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* <MaterialCommunityIcons
                  name='account-circle'
                  size={hp('4%')}
                  color={Primary}
                  style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}
                /> */}
                      <Text
                        style={{ ...main.content, marginTop: hp('2%') }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {'Account Holder Name:-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...main.content,
                        alignSelf: 'flex-start',
                        fontWeight: 'bold'
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {userInfo['accountHolderName']}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* <FontAwesome5
                    name='code-branch'
                    size={hp('4%')}
                    color={Primary}
                    style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}
                  /> */}
                      <Text
                        style={{ ...main.content, marginTop: hp('2%') }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {'Branch Name:-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...main.content,
                        marginTop: hp('2%'),
                        fontWeight: 'bold',
                        alignSelf: 'flex-start'
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {userInfo['branchName']}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* <MaterialCommunityIcons
                  name='account-box-multiple'
                  size={hp('4%')}
                  color={Primary}
                  style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}
                /> */}
                      <Text
                        style={{ ...main.content, marginTop: hp('2%') }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {'Account Number:-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...main.content,
                        marginTop: hp('2%'),
                        alignSelf: 'flex-start',
                        fontWeight: 'bold'
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {userInfo['accNo']}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      {/* <FontAwesome
                  name='bank'
                  size={hp('4%')}
                  color={Primary}
                  style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}
                /> */}
                      <Text
                        style={{ ...main.content, marginTop: hp('2%') }}
                        numberOfLines={1}
                        adjustsFontSizeToFit={true}
                      >
                        {'Bank Name:-'}
                      </Text>
                    </View>
                    <Text
                      style={{
                        ...main.content,
                        marginTop: hp('2%'),
                        alignSelf: 'flex-start',
                        fontWeight: 'bold'
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                    >
                      {userInfo['bankName']}
                    </Text>
                  </View>
                </View>
              </Card>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: hp('2.5%')
                }}
              >
                <Image
                  source={require('../../assets/bank_not_found.png')}
                  resizeMode={'contain'}
                  style={{
                    height: hp('20%'),
                    width: hp('20%'),
                    marginLeft: wp('5%'),
                    marginTop: hp('0.8%'),
                    marginBottom: hp('1%')
                  }}
                />

                <Text>{'You have not entered Bank Details'}</Text>
              </View>
            )}
            <Button
              style={{
                ...main.buttonStyle,
                marginBottom: hp('15%')
              }}
              labelStyle={{
                color: 'white',
                fontSize: hp('1.9%')
              }}
              onPress={() => {
                setShowBankDetailsForm(true)
              }}
            >
              {shouldShowBankInfo
                ? 'Update Bank Information'
                : 'Enter Bank Information'}
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
