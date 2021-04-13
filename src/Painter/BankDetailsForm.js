import React, { useState, useEffect } from 'react'
import { View, Text, TextInput } from 'react-native'
import Modal from 'react-native-modal'
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
  MaterialCommunityIcons,
  MaterialIcons
} from '../Icons/icons'
import { Primary, secondary } from '../Styles/colors'
import { main } from '../Styles/main'

export default function BankDetailsForm (props) {
  const [IFSC, setIFSC] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [accNo, setAccNo] = useState('')
  const [bankName, setBankName] = useState('')

  useEffect(() => {
    setIFSC(props.userInfo['IFSC'])
    setAccountHolderName(props.userInfo['accountHolderName'])
    setBranchName(props.userInfo['branchName'])
    setAccNo(props.userInfo['accNo'])
    setBankName(props.userInfo['bankName'])
  }, [])

  return (
    <Modal
      visible={props.visible}
      onBackButtonPressed={() => {
        props.onBackPressed(false)
      }}
    >
      <View style={{ height: hp('100%') }}>
        <ScrollView>
          <View>
            <Card
              style={{
                marginHorizontal: wp('3%'),
                marginTop: hp('3%'),
                marginBottom: hp('11%'),
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
                  <AntDesign
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
                    Bank Details
                  </Text>
                </View>
              </View>

              <Card style={main.inputContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={main.inputicon}>
                    <MaterialIcons
                      name='confirmation-number'
                      size={hp('4%')}
                      color='blue'
                    />
                  </View>
                  <TextInput
                    editable={true}
                    placeholder={'IFSC Code'}
                    placeholderTextColor='#CDC7C7'
                    style={main.input}
                    numberOfLines={1}
                    maxLength={15}
                    value={IFSC}
                    autoFocus={true}
                    onChangeText={setIFSC}
                  />
                </View>
              </Card>

              <Card style={main.inputContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={main.inputicon}>
                    <MaterialCommunityIcons
                      name='account-circle'
                      size={hp('4%')}
                      color='blue'
                    />
                  </View>
                  <TextInput
                    editable={true}
                    placeholder={'Account Holder Name'}
                    placeholderTextColor='#CDC7C7'
                    style={main.input}
                    value={accountHolderName}
                    numberOfLines={1}
                    maxLength={15}
                    autoFocus={true}
                    onChangeText={setAccountHolderName}
                  />
                </View>
              </Card>

              <Card style={main.inputContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={main.inputicon}>
                    <FontAwesome5
                      name='code-branch'
                      size={hp('4%')}
                      color='blue'
                    />
                  </View>
                  <TextInput
                    editable={true}
                    placeholder={'Branch Name'}
                    value={branchName}
                    placeholderTextColor='#CDC7C7'
                    style={main.input}
                    numberOfLines={1}
                    maxLength={15}
                    autoFocus={true}
                    onChangeText={setBranchName}
                  />
                </View>
              </Card>

              <Card style={main.inputContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={main.inputicon}>
                    <MaterialCommunityIcons
                      name='account-box-multiple'
                      size={hp('4%')}
                      color='blue'
                    />
                  </View>
                  <TextInput
                    editable={true}
                    placeholder={'Account Number'}
                    placeholderTextColor='#CDC7C7'
                    style={main.input}
                    numberOfLines={1}
                    value={accNo}
                    maxLength={15}
                    autoFocus={true}
                    onChangeText={setAccNo}
                  />
                </View>
              </Card>

              <Card style={main.inputContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={main.inputicon}>
                    <FontAwesome name='bank' size={hp('4%')} color='blue' />
                  </View>
                  <TextInput
                    editable={true}
                    placeholder={'Bank Name'}
                    placeholderTextColor='#CDC7C7'
                    style={main.input}
                    numberOfLines={1}
                    maxLength={15}
                    value={bankName}
                    autoFocus={true}
                    onChangeText={setBankName}
                  />
                </View>
              </Card>
              <Button
                onPress={() => {
                  props.onSaveInfo(
                    IFSC,
                    accountHolderName,
                    branchName,
                    accNo,
                    bankName
                  )
                }}
                style={{ ...main.buttonStyle }}
                labelStyle={{
                  color: 'white',
                  fontSize: hp('1.9%')
                }}
              >
                Save Information
              </Button>
              <Button
                onPress={() => {
                  props.onBackPressed(false)
                }}
                style={{
                  ...main.buttonStyleCancel,
                  marginBottom: hp('2%'),
                  marginTop: hp('1%')
                }}
                labelStyle={{
                  color: 'white',
                  fontSize: hp('1.9%')
                }}
              >
                Cancel
              </Button>
            </Card>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
