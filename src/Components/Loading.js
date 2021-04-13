import React from 'react';
import { View,Text, Image } from 'react-native';
import Modal from 'react-native-modal';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { ActivityIndicator } from 'react-native-paper';
import { Primary } from '../Styles/colors';

export default function Loading(props){
    return(
        <View style={{flex:1}}>
            <Modal
                isVisible = {props.isVisible}
                animationIn = {"fadeIn"}
            >
                <View style={{backgroundColor : 'white',height : hp('24%'),marginHorizontal : wp('10%'),borderRadius : wp('5%'),alignItems : 'center'}}>
                    <ActivityIndicator color = {Primary} size = {hp('7%')} style ={{marginTop : wp('8%')}}  />
                    <Image source = {require('../../assets/Logo.png')} style = {{height : hp('4%'),width : hp('4%'),resizeMode : 'contain',marginTop : -hp('5.5%')}} />
                    <Text style={{textAlign : 'center',marginTop : hp('5%'),fontSize : hp('2%'),color : 'black'}}>{props.data}...</Text>
                </View>
            </Modal>
        </View>
    )
} 