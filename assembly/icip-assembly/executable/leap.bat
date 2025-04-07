set JAVA_ARGS=-Xmx7G -Dspring.config.location=file:./conf/ -DLOG_PATH=.\log -Dencryption.key=leap$123## -Dencryption.salt=NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA== -Dspring.cloud.vault.enabled=false
java %JAVA_ARGS% -cp icip-app.jar;lib\*;modules\*;plugins\* com.infosys.CIP license\iampLicense1year.lic
