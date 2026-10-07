pipeline {
    agent any

    parameters {
        choice(
            name: 'TARGET',
            choices: ['all', 'android', 'desktop'],
            description: 'Platform cần build'
        )
        choice(
            name: 'BUMP',
            choices: ['patch', 'minor', 'major', 'none'],
            description: 'Tự động tăng phiên bản (Semantic Versioning)'
        )
        string(
            name: 'VERSION',
            defaultValue: '',
            description: 'Chỉ định phiên bản cụ thể (ví dụ: 0.2.0). Bỏ trống để dùng BUMP.'
        )
        string(
            name: 'BUILD_NUMBER',
            defaultValue: '',
            description: 'Chỉ định mã build (versionCode / buildNumber). Bỏ trống để tự động tăng.'
        )
        choice(
            name: 'VARIANT',
            choices: ['release', 'debug'],
            description: 'Kiểu build: release hoặc debug'
        )
        choice(
            name: 'ANDROID_FORMAT',
            choices: ['apk', 'aab'],
            description: 'Định dạng gói Android: apk hoặc aab'
        )
        choice(
            name: 'DESKTOP_BUNDLES',
            choices: ['app', 'dmg'],
            description: 'Định dạng gói Desktop macOS'
        )
        booleanParam(
            name: 'ALLOW_DEBUG_SIGNING',
            defaultValue: true,
            description: 'Cho phép dùng debug.keystore nếu thiếu key release'
        )
        booleanParam(
            name: 'DRY_RUN',
            defaultValue: false,
            description: 'Chỉ cập nhật cấu hình version, không chạy build thực tế'
        )
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout & Dependencies') {
            steps {
                echo 'Checking out source code and installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Run Tests & Lint') {
            steps {
                echo 'Running unit tests across workspaces...'
                sh 'npm run test'
            }
        }

        stage('Execute Build Pipeline') {
            steps {
                script {
                    echo "Triggering Jenkins-style Build Pipeline with TARGET=${params.TARGET}, BUMP=${params.BUMP}, VERSION=${params.VERSION}, BUILD_NUMBER=${params.BUILD_NUMBER}..."
                    sh '''
                        node scripts/pipeline.mjs \
                            --target="${TARGET}" \
                            --bump="${BUMP}" \
                            --version="${VERSION}" \
                            --build-number="${BUILD_NUMBER}" \
                            --variant="${VARIANT}" \
                            --android-format="${ANDROID_FORMAT}" \
                            --desktop-bundles="${DESKTOP_BUNDLES}" \
                            ${ALLOW_DEBUG_SIGNING ? '--allow-debug-signing' : ''} \
                            ${DRY_RUN ? '--dry-run' : ''}
                    '''
                }
            }
        }

        stage('Archive Artifacts') {
            when {
                expression { return !params.DRY_RUN }
            }
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: 'apps/mobile/android/app/build/outputs/**/*.apk, apps/desktop/src-tauri/target/release/bundle/macos/**/*', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo 'Build pipeline completed successfully!'
        }
        failure {
            echo 'Build pipeline failed!'
        }
    }
}
