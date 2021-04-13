import React, { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Card } from 'react-native-paper'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Header from '../Components/mainHeader'
import { FontAwesome, MaterialCommunityIcons } from '../Icons/icons'
import { f } from '../config/config'
import LoadingBar from '../Components/Loading'
import DataLoader from '../Components/DataLoader'

export default function Transaction () {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)

  var userId
  useEffect(() => {
    setInitializing(true)
    userId = f.auth().currentUser.uid
    const subscriber = f
      .firestore()
      .collection('qr_requests')
      .where('user', '==', userId)
      .onSnapshot(r => {
        let temp = []
        for (let i = 0; i < r.docs.length; i++) {
          let data = r.docs[i].data()
          console.log('data = ', data)
          temp.push({
            ...data,
            id: r.docs[i].id
          })
          console.log(r.docs[i].id)
        }
        console.log(r.docs.length)
        setInitializing(false)
        setTransactions(temp)
      })
    return () => subscriber()
  }, [])

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
    <View style={{ flex: 1 }}>
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
          ListFooterComponent={<View style={{ marginTop: hp('2%') }}></View>}
        />
      )}

      {loading ? <LoadingBar isVisible={loading} data={'Loading'} /> : <View />}
    </View>
  )
}
