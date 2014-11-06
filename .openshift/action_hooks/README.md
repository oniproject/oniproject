For information about action hooks supported by OpenShift, consult the documentation:

http://openshift.github.io/documentation/oo_user_guide.html#the-openshift-directory

`pre_build` Executed on your CI system if available. Otherwise, executed before the build step

`build` Executed on your CI system if available. Otherwise, executed before the deploy step

`prepare` Executed just prior to a deployment ID being calculated and before the deployment is ready to use

`deploy` Executed after dependencies are resolved but before application has started

`post_deploy` Executed after application has been deployed and started
