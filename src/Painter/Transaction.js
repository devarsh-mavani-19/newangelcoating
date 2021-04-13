import React, { useEffect, useState } from 'react'
import { View, Text, SafeAreaView } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { Button, Card } from 'react-native-paper'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import { FontAwesome, MaterialCommunityIcons } from '../Icons/icons'
import { f, firestore } from '../config/config'
import LoadingBar from '../Components/Loading'
import DataLoader from '../Components/DataLoader'
import { main } from '../Styles/main'
import { roundToNearestPixel } from 'react-native/Libraries/Utilities/PixelRatio'

export default function Transaction () {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastTimestamp, setLastTimestamp] = useState(0)
  const [isMoreDataAvailable, setIsMoreDataAvailable] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [userId, setUserId] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setInitializing(true)
    setUserId(f.auth().currentUser.uid)
    // console.log(userId)
    // const loaddata = async () => {
    const ref = firestore.collection('withdrawrequests')
    //   await ref
    //     .where('user', '==', f.auth().currentUser.uid)
    //     .get()
    //     .then(r => {
    //       let temp = []
    //       if (r && !r.empty) {
    //         r.docs.forEach(rd => {
    //           let data = rd.data()
    //           temp.push({
    //             ...data,
    //             id: rd.id
    //           })
    //         })
    //         setTransactions(temp)
    //         setInitializing(false)
    //         console.log(temp)
    //       }
    //     })
    //     .catch(e => {
    //       console.log(e)
    //     })
    // }

    // loaddata()

    // ref.where('user', '==', userId).onSnapshot(
    //   docData => {
    //     var requestData = []
    //     if (docData && !docData.empty) {
    //       console.log('length = ', docData.docs.length)
    //       if (docData.docs.length > 0) {
    //         console.log('l = l = ', docData.docChanges().length)
    //         docData.docChanges().forEach(doc => {
    //           let request = doc.data()
    //           console.log(typeof { ...request })
    //           requestData.push({
    //             ...request,
    //             id: doc.id
    //           })
    //         })
    //         setTransactions(requestData)
    //         setInitializing(false)
    //         // docData.docs.forEach(doc => {

    //         // })
    //       } else {
    //         console.log('length  0')
    //         setTransactions([])
    //         setInitializing(false)
    //       }
    //     } else {
    //       console.log('null')
    //       setTransactions([])
    //       setInitializing(false)
    //     }
    //   },
    //   e => {
    //     console.log('error = ', e)
    //   }
    // )

    let subscriber
    setInitializing(true)
    setTransactions([])

    // firestore
    //   .clearPersistence()
    //   .then(r => {
    subscriber = firestore
      .collection('withdrawrequests')
      .where('user', '==', f.auth().currentUser.uid)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .onSnapshot(
        r => {
          if (r && !r.empty) {
            let temp = []
            r.forEach(doc => {
              let data = doc.data()

              temp.push({
                ...data,
                id: doc.id
              })
            })

            setTransactions(temp)

            setLastTimestamp(r.docs[r.docs.length - 1].data()['timestamp'])
            setInitializing(false)
            if (r.docs.length < 5) {
              //all data fetched
              setIsMoreDataAvailable(false)
            } else {
              setIsMoreDataAvailable(true)
            }
          } else {
            setInitializing(false)
            setTransactions([])
          }
        },
        function (e) {
          console.log(e)
        }
      )
    // })
    // .catch(e => {})

    return () => {
      console.log('unsubscribing')
      subscriber()
    }
  }, [])
  const refresh = () => {
    setRefreshing(true)
    loadMore()
    setRefreshing(false)
  }

  const loadMore = async () => {
    await f
      .firestore()
      .collection('withdrawrequests')
      .where('user', '==', userId)
      .orderBy('timestamp', 'desc')
      .startAfter(lastTimestamp)
      .limit(5)
      .get()
      .then(r => {
        if (r && !r.empty) {
          let temp = []
          for (let i = 0; i < r.docs.length; i++) {
            let data = r.docs[i].data()

            temp.push({
              ...data,
              id: r.docs[i].id
            })
          }
          console.log(r.docs.length)
          setLoading(false)
          setTransactions([...transactions, ...temp])
          setLastTimestamp(r.docs[r.docs.length - 1].data()['timestamp'])
          if (r.docs.length < 5) {
            //all data fetched
            setIsMoreDataAvailable(false)
          } else {
            setIsMoreDataAvailable(true)
          }
        } else {
          setLoading(false)
        }
      })
      .catch(e => {
        console.log(e)
        alert('Something Bad Happend')
      })
  }

  const TranscationUI = data => {
    return (
      <Card
        style={{
          marginTop: hp('3%'),
          marginHorizontal: wp('3%'),
          borderRadius: wp('5%'),
          elevation: 10,
          height: hp('25%'),
          overflow: 'hidden'
        }}
      >
        <View style={{ marginLeft: wp('5%'), marginTop: hp('2%') }}>
          <Text style={{ color: 'black', fontSize: hp('2.2%') }}>
            Transaction id : {data['item']['id']}
          </Text>
        </View>
        <View style={{ marginTop: hp('1%'), marginLeft: wp('5%') }}>
          <Text style={{ fontWeight: 'bold' }}>
            {`${new Date(data['item']['timestamp'])}`}
          </Text>
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
              size={hp('10%')}
              color={'black'}
            />
            <View style={{ marginLeft: wp('2%'), marginTop: hp('1%') }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: 'black', fontSize: hp('2%') }}>
                  Status:
                </Text>
                <Text
                  style={{
                    color: `${
                      data['item']['status'] == 0
                        ? 'red'
                        : data['item']['status'] == 1
                        ? 'green'
                        : 'orange'
                    }`,
                    fontSize: hp('2%')
                  }}
                >
                  {`${
                    data['item']['status'] == 0
                      ? 'Denied'
                      : data['item']['status'] == 1
                      ? 'Approved'
                      : 'Pending'
                  }`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                <FontAwesome name='rupee' size={hp('2.5%')} color={'black'} />
                <Text
                  style={{
                    color: 'black',
                    fontSize: hp('2.5%'),
                    marginLeft: wp('1.5%'),
                    marginTop: -hp('0.7%'),
                    fontWeight: 'bold'
                  }}
                >
                  {data['item']['amount']}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    )
  }

  return (
    <View style={{ flex: 1, alignItems: 'stretch' }}>
      <Header Name={'Transactions'} />
      {initializing ? (
        <DataLoader style={{ flex: 1 }} />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={TranscationUI}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            refresh()
          }}
          ListFooterComponent={
            <View
              style={{
                marginVertical: hp('3%'),
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {isMoreDataAvailable ? (
                <Button
                  style={{
                    ...main.buttonStyle,
                    marginBottom: hp('1%'),
                    marginVertical: hp('1%'),
                    marginHorizontal: wp('5%'),
                    height: hp('8%')
                  }}
                  labelStyle={{
                    color: 'white',
                    fontSize: hp('1.9%')
                  }}
                  onPress={() => {
                    loadMore()
                  }}
                >
                  {'Load More'}
                </Button>
              ) : (
                <Text>All Data Loaded</Text>
              )}
            </View>
          }
        />
      )}

      {loading ? <LoadingBar isVisible={loading} data={'Loading'} /> : <View />}
    </View>
  )
}
