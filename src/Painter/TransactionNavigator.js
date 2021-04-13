import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { createMaterialTopTabNavigator } from 'react-navigation-tabs'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'

//Screens
import Transaction from './Transaction'
import Transaction_QrCodes from './Transaction_QrCodes'
import { Primary } from '../Styles/colors'

const TabScreens = {
  Withdraw: {
    title: 'Withdraw Requests',
    screen: Transaction,
    navigationOptions: () => ({
      title: 'Withdraw'
    })
  },

  Qr_Codes: {
    title: 'Qr Code',
    screen: Transaction_QrCodes,
    navigationOptions: () => ({
      title: 'Qr Code'
    })
  }
}

const Tab = createMaterialTopTabNavigator(
  TabScreens,
  {
    tabBarOptions: {
      activeTintColor: Primary,
      inactiveTintColor: '#99accf',
      indicatorStyle: {
        width: 0
      },

      contentContainerStyle: {
        alignItems: 'center'
      },

      style: {
        height: hp('6%'),
        backgroundColor: 'white',
        overflow: 'hidden',
        marginHorizontal: wp('3%'),
        marginVertical: hp('2%'),
        borderRadius: wp('5%')
      },
      labelStyle: {
        fontSize: hp('1.6%'),
        fontWeight: 'bold'
      }
    }
  },
  {}
)

const MainScreens = createStackNavigator(
  {
    screen: Tab
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false
    }
  }
)

export default createAppContainer(MainScreens)
