import React, { useEffect, useState } from 'react'
import styles from './UserMainTest.module.css'
import { useSelector } from 'react-redux'
import MainWeather from '../weather/mainWeather'
import GaugeDesign from '../../components/practice/GaugeDesign'
import ProgressBarChart from '../../components/practice/ProgressBarChart'
import Legend from '../../components/Legend'
import { useNavigate } from 'react-router-dom'
import FarmseyeButton from '../../common_component/FarmseyeButton'
import { selectEnvList } from '../../apis/enviromentApi'
import WeekWeather from '../weather/WeekWeather'
import WeatherDetail from '../weather/WeatherDetail'
import LineChartComponent from '../../components/LineChartComponent'
import ProgressBarChartHor from '../../components/practice/ProgressBarChartHor'

const UserMainTest = () => {
  const nav = useNavigate();

  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false); // 모달 열기/닫기 상태

  //오늘 날짜 받아오기
  const today = useSelector(state => state.today.today);

  //오늘 기준 농장 내부 환경 데이터 12개
  const [envData, setEnvData] = useState(null);

  //temp, humi, illumi, co2, no2, nh3, h2s 현재값
  const [appropriateNowData, setAppropriateNowData] = useState({
    temp : 0,
    humi : 0,
    illumi : 0,
    co2 : 0,
    no2 : 0,
    nh3 : 0,
    h2s : 0
  });

  //temp, humi, illumi 최소-최댓값
  const minMaxData = {
    tempMin : 18,
    tempMax : 24,
    humiMin : 50,
    humiMax : 60,
    illumiMin : 10,
    illumiMax : 20
  }

  //co2, no2, nh3, h2s 적정 수치값
  const appropriateData = {
    co2 : 3000,
    no2 : 5,
    nh3 : 1,
    h2s : 0.5
  }

  //co2, no2, nh3, h2s 위험 수치값
  const appropriateDangerData = {
    co2 : 5000,
    no2 : 10,
    nh3 : 2.5,
    h2s : 2
  }

  const convertToLux = (adcValue) => {
    // 밝을수록 ADC값이 커지는 경우를 보정
    const maxADC = 1023;
    const lux = ((adcValue / maxADC) * 100); // 0~100 lx 스케일 예시
    return parseFloat(lux.toFixed(1));
  }
  

  useEffect(() => {
    const fetchEnvData = async () => {
      try {
        const res = await selectEnvList();
        const data = res.data[res.data.length - 1];
        const env = res.data.filter((item) => {
          // item.illumi = (10000 / (item.illumi + 10)).toFixed(1)
          item.illumi = convertToLux(item.illumi);

          const date = new Date(item.timestamp)
          return date.getHours() === 15;
        })
        const envCopy = []
        for(let i = env.length - 12 ; i < env.length ; i ++){
          envCopy.push(env[i])
        }
        setEnvData(envCopy);
  
        setAppropriateNowData(prev => ({
          ...prev,
          temp : data.temp,
          humi : data.humi,
          illumi : data.illumi,
          co2: data.co2.toFixed(1),
          no2: data.no2.toFixed(3),
          nh3: data.nh3.toFixed(3),
          h2s: data.h2s.toFixed(3),
        }));
      } catch (error) {
        console.error("환경 데이터를 불러오는 중 오류 발생:", error);
      }
    };
    
    fetchEnvData();

    // 5분마다 반복 실행
    const interval = setInterval(() => {
      fetchEnvData();
    }, 60 * 5 * 1000); // 5분 = 300,000ms
    console.log(appropriateNowData);

    // 컴포넌트 언마운트 시 clear
    return () => clearInterval(interval);
  }, []);
  

  return (
    <div className={styles.background}>
      <div className={styles.chart_title}>
        <p>Today Chart</p>
        <p className={styles.detail} onClick={e => nav('/main/enviroment')}>+ 상세보기</p>
      </div>
      
      <div className={styles.container}>

        <div className={styles.left_panel}>
          {/* <p className={styles.nav_farms}>MY FARMS 바로가기</p>
          <p className={styles.chart_title}> 내부 (온도 / 습도 / 조도)</p>
          <LineChartComponent envData={envData}/>  */}
          {/* line chart 그래프 컴포넌트 (recharts 사용 추천) */} 

          {
            appropriateNowData.temp === 0 ? null : 
            <>
              <div className={styles.status_box}>
                <p>현재 상태</p><br />
                <div>온도 : <span>{appropriateNowData.temp} (℃)</span> 
                  <div className={styles.status} style={{
                  backgroundColor: (appropriateNowData.temp <= minMaxData.tempMin) || (appropriateNowData.temp >= minMaxData.tempMax) ? '#FFC145' : '#16C47F'
                  }}/>
                </div>

                <div>습도 : <span>{appropriateNowData.humi} (%)</span>
                  <div className={styles.status} style={{
                  backgroundColor: (appropriateNowData.humi <= minMaxData.humiMin) || (appropriateNowData.humi >= minMaxData.humiMax) ? '#FFC145' : '#16C47F'
                  }}/>
                </div>

                <div>조도 : <span>{appropriateNowData.illumi} (lx)</span>
                  <div className={styles.status} style={{
                  backgroundColor: (appropriateNowData.illumi <= minMaxData.illumiMin) || (appropriateNowData.illumi >= minMaxData.illumiMax) ? '#FFC145' : '#16C47F'
                  }}/>
                </div>

                <div>CO2 : <span>{appropriateNowData.co2} (ppm)</span>
                  <div className={styles.status} style={{
                  backgroundColor: appropriateNowData.co2 >= appropriateDangerData.co2 ? '#FB4141': (appropriateNowData.co2 >= appropriateData.co2 ? '#FFC145' : '#16C47F')
                  }}/>
                </div>

                <div>NO2 : <span>{appropriateNowData.no2} (ppm)</span>
                  <div className={styles.status} style={{
                  backgroundColor: appropriateNowData.no2 >= appropriateDangerData.no2 ? '#FB4141': (appropriateNowData.no2 >= appropriateData.no2 ? '#FFC145' : '#16C47F')
                  }}/>
                </div>

                <div>NH3 : <span>{appropriateNowData.nh3} (ppm)</span>
                  <div className={styles.status} style={{
                  backgroundColor: appropriateNowData.nh3 >= appropriateDangerData.nh3 ? '#FB4141': (appropriateNowData.nh3 >= appropriateData.nh3 ? '#FFC145' : '#16C47F')
                  }}/>
                </div>

                <div>H2S : <span>{appropriateNowData.h2s} (ppm)</span>
                  <div className={styles.status} style={{
                  backgroundColor: appropriateNowData.h2s >= appropriateDangerData.h2s ? '#FB4141': (appropriateNowData.h2s >= appropriateData.h2s ? '#FFC145' : '#16C47F')
                  }}/>
                </div>
              </div>

              <div>
                <p className={styles.now_title}> 온도 : {appropriateNowData.temp} ℃</p>
                <GaugeDesign 
                appropriate={appropriateNowData.temp} 
                min={minMaxData.tempMin} 
                max={minMaxData.tempMax} 
                />
              </div>

              <div>
                <p className={styles.now_title}> 현재 습도 : {appropriateNowData.humi} %</p>
                <GaugeDesign 
                appropriate={appropriateNowData.humi} 
                min={minMaxData.humiMin} 
                max={minMaxData.humiMax} 
                />
              </div>

              <div>
                <p className={styles.now_title}> 현재 조도 : {appropriateNowData.illumi} lx</p>
                <GaugeDesign 
                appropriate={appropriateNowData.illumi} 
                min={minMaxData.illumiMin} 
                max={minMaxData.illumiMax} 
                />
              </div>
            </>
          }
        </div>
    
        <div className={styles.right_panel}>
          
          <div className={styles.weather_box}>
            <div>
              <p>Today Weather</p>
              <button 
                className={styles.weather_btn}
                type='button' 
                onClick={e => {
                  setIsWeatherModalOpen(true)
                }} 
              >+ 주간 날씨</button>
            </div>

            <MainWeather today={today} />
          </div>

        </div>
      </div>



      <div className={styles.aircondition}>
        
        <div className={styles.card_item}>
          <p>CO2 <span>{appropriateNowData.co2}</span></p>

          <ProgressBarChartHor 
            max={appropriateData.co2} 
            current={appropriateNowData.co2} 
            danger={appropriateDangerData.co2}
          />
        </div>

        <div className={styles.card_item}>
          <p>NO2 <span>{appropriateNowData.no2}</span></p>

          <ProgressBarChartHor
            max={appropriateData.no2} 
            current={appropriateNowData.no2} 
            danger={appropriateDangerData.no2} 
          />
        </div>

        <div className={styles.card_item}>
          <p>NH3 <span>{appropriateNowData.nh3}</span></p>

          <ProgressBarChartHor 
            max={appropriateData.nh3} 
            current={appropriateNowData.nh3} 
            danger={appropriateDangerData.nh3} 
          />
        </div>

        <div className={styles.card_item}>
          <p>H2S <span>{appropriateNowData.h2s}</span></p>
          <ProgressBarChartHor 
            max={appropriateData.h2s} 
            current={appropriateNowData.h2s} 
            danger={appropriateDangerData.h2s} 
          />
        </div>
        <Legend />
      </div>

      
      

      {isWeatherModalOpen && <WeatherDetail onClick={() => setIsWeatherModalOpen(false)} />}
    </div>
  );
  
}

export default UserMainTest