allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory = rootProject.layout.buildDirectory.dir("../../build").get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
buildscript {
    // Example versions (check for latest stable versions compatible with your Flutter)
    ext.kotlin_version = '1.8.20' // Or newer compatible version
    repositories {
        google()
        mavenCentral()
    }
    //dependencies {
    //    // Example AGP version (check for latest stable compatible version)
    //    classpath 'com.android.tools.build:gradle:7.4.2' // Or newer compatible version
    //    classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    //}
}
