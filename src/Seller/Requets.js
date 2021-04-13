import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Button, Card } from 'react-native-paper'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { FontAwesome, MaterialCommunityIcons } from '../Icons/icons'
import { Primary } from '../Styles/colors'
import { database, f, firestore } from '../config/config'
import LoadingBar from '../Components/Loading'
import DataLoader from '../Components/DataLoader'

export default function Requests (props) {
  const [transactions, setTransactions] = useState([])
  const [sellerCode, setSellerCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)

  var uid
  useEffect(() => {
    let subscriber
    setInitializing(true)
    uid = f.auth().currentUser.uid
    f.firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(r => {
        setSellerCode(r.data()['code'])
        subscriber = f
          .firestore()
          .collection('qr_requests')
          .where('sellerCode', '==', `${r.data()['code']}`)
          .onSnapshot(r => {
            let temp = []
            r.forEach(transaction => {
              if (transaction.data()['status'] == 2)
                temp.push({ ...transaction.data(), tid: transaction.id })
            })
            setTransactions(temp)
            setInitializing(false)
          })
      })
      .catch(e => {
        console.log(e)
        setInitializing(false)
        alert("Something Wen't Wrong")
      })

    return () => {
      subscriber()
    }
  }, [])

  const onApprove = data => {
    setLoading(true)
    console.log('Approved', sellerCode)
    let docRef = f
      .firestore()
      .collection('qr_requests')
      .doc(data['tid'])

    firestore.runTransaction(t => {
      t.update(docRef, { status: 1 })
      const ref = f
        .database()
        .ref()
        .child('qrcodes')
        .child(data['id'])

      ref
        .update({ status: 3 })
        .then(r => {
          console.log(data)
          ToastAndroid.show('Request Approved', ToastAndroid.LONG)
          let temp = []
          temp = transactions.filter(transaction => {
            return transaction['tid'] != data['tid']
          })

          f.firestore()
            .collection('users')
            .doc(data['user'])
            .update({
              wallet: data['amount']
            })
            .finally(() => {
              setTransactions(temp)
              setLoading(false)
            })
        })
        .catch(e => {
          console.log(e)
          setLoading(false)
          alert('Something bad happend')
        })
    })
    // f.firestore()
    //   .collection('qr_requests')
    //   .doc(data['tid'])
    //   .update({
    //     status: 1 //approved
    //   })
    //   .then(r => {
    //     f.database()
    //       .ref()
    //       .child('qrcodes')
    //       .child(data['id'])
    //       .update({ status: 3 })
    //       .then(r => {
    //         console.log(data)
    //         ToastAndroid.show('Request Approved', ToastAndroid.LONG)
    //         let temp = []
    //         temp = transactions.filter(transaction => {
    //           return transaction['tid'] != data['tid']
    //         })
    //         setTransactions(temp)
    //         setLoading(false)
    //       })
    //       .catch(e => {
    //         console.log(e)
    //         setLoading(false)
    //         alert('Something bad happend')
    //       })
    //   })
    //   .catch(e => {
    //     console.log(e)
    //     setLoading(false)
    //     alert('Something bad happend')
    //   })
  }

  const onDeny = data => {
    setLoading(true)
    console.log('Deny')
    f.firestore()
      .collection('qr_requests')
      .doc(data['tid'])
      .update({
        status: 0 //approved
      })
      .then(r => {
        f.database()
          .ref()
          .child('qrcodes')
          .child(data['id'])
          .update({ status: 0 })
          .then(r => {
            console.log(data)
            ToastAndroid.show('Request Denied', ToastAndroid.LONG)
            let temp = []
            temp = transactions.filter(transaction => {
              return transaction['tid'] != data['tid']
            })
            setTransactions(temp)
            setLoading(false)
          })
          .catch(e => {
            console.log(e)
            setLoading(false)
            alert('Something bad happend')
          })
      })
      .catch(e => {
        console.log(e)
        setLoading(false)
        alert('Something bad happend')
      })
  }

  const RequestUI = data => {
    return (
      <Card
        style={{
          height: hp('28%'),
          marginHorizontal: wp('3%'),
          borderRadius: wp('3%'),
          elevation: 10,
          marginTop: hp('3%')
        }}
      >
        <View style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}>
          <Text style={{ color: 'black', fontSize: hp('2.2%') }}>
            Transaction id : {data['item']['tid']}
          </Text>
        </View>
        <View style={{ marginTop: hp('1%'), marginLeft: wp('5%') }}>
          <Text style={{ fontWeight: 'bold' }}>{`${new Date(
            data['item']['timestamp']
          )}`}</Text>
        </View>
        <View
          style={{
            marginTop: hp('3%'),
            flexDirection: 'row',
            marginLeft: wp('5%')
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons
              name='qrcode'
              size={hp('13%')}
              color={'black'}
            />
            <View style={{ marginLeft: wp('2%'), marginTop: hp('0.5%') }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'black', fontSize: hp('2.5%') }}>
                  {`${data['item']['lName']} ${data['item']['fName']}`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => onApprove(data['item'])}
                >
                  <Button
                    style={{
                      backgroundColor: Primary,
                      borderRadius: wp('3%'),
                      height: hp('6%')
                    }}
                    labelStyle={{ color: 'white', fontSize: hp('1.8%') }}
                  >
                    APPROVE
                  </Button>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => onDeny(data['item'])}
                >
                  <Button
                    style={{
                      backgroundColor: 'red',
                      borderRadius: wp('3%'),
                      height: hp('6%'),
                      marginLeft: wp('5%')
                    }}
                    labelStyle={{ color: 'white', fontSize: hp('1.8%') }}
                  >
                    DENY
                  </Button>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Card>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1 }}
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={RequestUI}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ marginTop: hp('3%') }}></View>}
      />
      {loading ? (
        <LoadingBar isVisible={loading} data={'Processing'} />
      ) : (
        <View />
      )}
      {initializing ? <DataLoader style={{ flex: 1 }} /> : <View />}
    </View>
  )
}
