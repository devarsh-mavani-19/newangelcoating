import React from 'react';
import { 
    View,
    Text,
    ImageBackground,
    TouchableNativeFeedback,
    StyleSheet,
    Dimensions,
    Image, 
    TouchableOpacity
} from 'react-native';
import {
    widthPercentageToDP as wp, 
    heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { Ionicons, SimpleLineIcons } from '../Icons/icons';
import { Card } from 'react-native-paper';
import  Modal from 'react-native-modal';
import * as Permissions from 'expo-permissions';
import { LogBox } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Primary, secondary } from '../Styles/colors';
import Header from '../Components/header';
import { f } from '../config/config';
import Loading from '../Components/Loading';
import { StyleProvider } from 'native-base';

export default class Adhar_Card extends React.Component{

    constructor(){
        super();
        this.state = {
           processs : 0
        }
        LogBox.ignoreLogs(['User rejected permissions']);
    };

    componentDidMount = async () => {
        await this.cheackpermissionsforCamera();
        await this.getGalleryPermissionAsync();
    }

    s4 = () => {
        return Math.floor((1+Math.random())* 0x10000).toString(16).substring(1);
    }
      
    uniqueid = () => {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
        this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4();
    }


    getGalleryPermissionAsync = async () => {
          let Gallery = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
          if ( Gallery.status !== "granted") {
            alert('Sorry, we need Gallery permissions to make this work!');
        }
    };

    cheackpermissionsforCamera = async () => {
        let Cam = await Permissions.askAsync(Permissions.CAMERA);
        if ( Cam.status !== "granted") {
            alert('Sorry, we need Gallery permissions to make this work!');
        }
      }


    _pickGalleryImage = async () => {
        var that = this;
        try{

            ImagePicker.openPicker({
                mediaType : 'photo',
                cropping : true
            }).then( async res => {
                if(!res.path){
                    alert("Your Image is Not selected ! Try Again");
                }else{
                    that.setState({
                        imageid : that.uniqueid(),
                        ProfilePhoto : res.path,
                    });
                    this.setState({ process : 2 })
                    const painterdata = this.props.navigation.getParam('painter_data');
                    console.log(painterdata[0].phone);
                    await f.auth().signInWithPhoneNumber(painterdata[0].phone).then(r => {
                        this.setState({ process : 0 })
                        that.props.navigation.navigate({routeName : 'OTP',params : {
                            firstName: painterdata[0].firstName,
                            lastName: painterdata[0].lastName,
                            Emailid: painterdata[0].Emailid,
                            accountType: painterdata[0].accountType,
                            phone: painterdata[0].phone,
                            confirmResult: r,
                            SellerCode : painterdata[0].SellerCode,
                            isapproved : false,
                            SellerId : painterdata[0].SellerId,
                            PP : painterdata[0].PP,
                            imgid : painterdata[0].imgid,
                            Adhar_Card : that.state.ProfilePhoto, 
                            Adharimgid : that.state.imageid
                        }});
                    }).catch((e) =>  {
                        this.setState({ process : 0 })
                        alert('somthing bad happen');
                    });
                }
            }).catch(e => {
                console.log(e);
                alert("Your Image is Not selected ! Try Again");
            })

    }catch (error){
        console.log(error)
    }
    };

    render(){

        return(
            <View style = {{flex : 1,backgroundColor : 'white'}}>
                <Header
                    Name={'Adhar Card'}
                    onPress={() => this.props.navigation.navigate('')}
                />

                <View style = {{marginTop : hp('10%'),backgroundColor : 'white',borderTopLeftRadius : wp('15%')}}>
                <Text style = {{fontSize : hp('2.5%'),color : Primary, fontWeight : 'bold',textAlign : 'center'}}>Adhar Card Image ??</Text>
                <View style={styles.profile}>
                    <Image source={require('../../assets/id-card.png')} style={styles.image}/> 
                </View>
                <View style={{alignItems:'center'}}>
                    <TouchableNativeFeedback onPress = {()=> this._pickGalleryImage()}> 
                        <Card style={styles.button}>
                            <Text style={styles.buttontext}>Add Adhar Card</Text>
                        </Card>
                    </TouchableNativeFeedback>
                </View>
                </View>

                <Loading 
                    isVisible = {this.state.process > 0}
                    data = {"Sending OTP..."}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    ImageBackground:{
        height:hp('40%'),
        width:wp('100%'),
        backgroundColor: '#154293',
    },
    title:{
        color:'white',
        fontSize:38,
        fontWeight:'bold',
        marginLeft:30,
        marginTop:wp('7%')
    },
    icon:{
        marginLeft:wp('5%'),
        marginTop:wp('8%')
    },
    button:{
        alignItems:'center',
        height:hp('10%'),
        width:wp('60%'),
        marginTop:hp('5%'),
        backgroundColor: secondary,
        borderRadius:wp('5%'),
        elevation : 20
    },
    buttontext:{
        color:'white',
        fontSize:hp('2.5%'),
        marginTop : hp('3%')
    },
    image:{
        width:hp('25%'),
        height:hp('20%'),
        resizeMode : 'contain',
        borderWidth : 1,
        borderColor : 'black'
    },
    profile:{
        marginTop:hp('12%'),
        alignItems:'center'
    },
    Modal : {
        backgroundColor:'white',
        borderRadius:wp('5%'),
        overflow:'hidden',
        marginHorizontal:wp('8%'),
        height : hp('30%')
    },
    option : {
        flexDirection:'row',
        justifyContent:'space-around',
        marginTop : hp('4%')
    },
    iconCon:{
        width: hp('12%'),
        height: hp('12%'),
        borderRadius: hp('12%')/2,
        backgroundColor: 'white',
        marginTop:Dimensions.get('screen').width<400?hp('2%'):hp('1%'),
        overflow:'hidden',
        borderWidth:1,
        alignItems : 'center',
        justifyContent : 'center'
    },
    icon2:{
        width:hp('7%'),
        height:hp('7%'),
        resizeMode : 'contain'
    },
    optiontitle : {
        fontSize : hp('2.5%'),
        fontWeight:'bold',
        color : Primary
    }
})