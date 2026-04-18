<?php
/**
 * Simple SMTP Mailer Class
 * Sends emails via SMTP with SSL/TLS support
 */

class SMTPMailer {
    private $host;
    private $port;
    private $username;
    private $password;
    private $fromEmail;
    private $fromName;
    private $connection;
    private $logFile;
    
    public function __construct($host, $port, $username, $password, $fromEmail = null, $fromName = 'MotorLink') {
        $this->host = $host;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
        $this->fromEmail = $fromEmail ?: $username;
        $this->fromName = $fromName;
        $this->logFile = __DIR__ . '/../logs/smtp_emails.log';
        
        // Create logs directory if it doesn't exist
        if (!is_dir(__DIR__ . '/../logs')) {
            @mkdir(__DIR__ . '/../logs', 0755, true);
        }
    }
    
    /**
     * Send email via SMTP
     */
    public function send($to, $subject, $htmlMessage, $textMessage = null) {
        try {
            // Connect to SMTP server
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            
            $this->connection = stream_socket_client(
                "ssl://{$this->host}:{$this->port}",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );
            
            if (!$this->connection) {
                $this->log("Connection failed: $errstr ($errno)");
                return false;
            }
            
            // Read server greeting
            $this->readResponse();
            
            // Send EHLO
            $this->sendCommand("EHLO " . $this->host);
            $this->readResponse();
            
            // Authenticate
            $this->sendCommand("AUTH LOGIN");
            $this->readResponse();
            $this->sendCommand(base64_encode($this->username));
            $this->readResponse();
            $this->sendCommand(base64_encode($this->password));
            $authResponse = $this->readResponse();
            
            if (strpos($authResponse, '235') === false) {
                $this->log("Authentication failed: $authResponse");
                $this->close();
                return false;
            }
            
            // Set sender
            $this->sendCommand("MAIL FROM: <{$this->fromEmail}>");
            $this->readResponse();
            
            // Set recipient
            $this->sendCommand("RCPT TO: <$to>");
            $this->readResponse();
            
            // Send email data
            $this->sendCommand("DATA");
            $this->readResponse();
            
            // Build email headers and body
            $emailData = $this->buildEmail($to, $subject, $htmlMessage, $textMessage);
            $this->sendCommand($emailData);
            
            // End data
            $this->sendCommand(".");
            $dataResponse = $this->readResponse();
            
            // Quit
            $this->sendCommand("QUIT");
            $this->readResponse();
            $this->close();
            
            if (strpos($dataResponse, '250') !== false) {
                $this->log("Email sent successfully to: $to");
                return true;
            } else {
                $this->log("Email sending failed: $dataResponse");
                return false;
            }
            
        } catch (Exception $e) {
            $this->log("Exception: " . $e->getMessage());
            if ($this->connection) {
                $this->close();
            }
            return false;
        }
    }
    
    /**
     * Build email with headers and body
     */
    private function buildEmail($to, $subject, $htmlMessage, $textMessage) {
        $boundary = "----=_NextPart_" . md5(time());
        $headers = [];
        
        $headers[] = "From: {$this->fromName} <{$this->fromEmail}>";
        $headers[] = "Reply-To: support@motorlink.mw";
        $headers[] = "To: <$to>";
        $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "X-Mailer: PHP/" . phpversion();
        $headers[] = "X-Priority: 1";
        $headers[] = "Importance: High";
        
        if ($textMessage) {
            // Multipart email with both HTML and text
            $headers[] = "Content-Type: multipart/alternative; boundary=\"$boundary\"";
            $body = "\r\n--$boundary\r\n";
            $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $textMessage . "\r\n";
            $body .= "\r\n--$boundary\r\n";
            $body .= "Content-Type: text/html; charset=UTF-8\r\n";
            $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $body .= $htmlMessage . "\r\n";
            $body .= "\r\n--$boundary--\r\n";
        } else {
            // HTML only
            $headers[] = "Content-Type: text/html; charset=UTF-8";
            $body = $htmlMessage;
        }
        
        return implode("\r\n", $headers) . "\r\n\r\n" . $body;
    }
    
    /**
     * Send command to SMTP server
     */
    private function sendCommand($command) {
        fwrite($this->connection, $command . "\r\n");
    }
    
    /**
     * Read response from SMTP server
     */
    private function readResponse() {
        $response = '';
        while ($line = fgets($this->connection, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) == ' ') {
                break;
            }
        }
        return $response;
    }
    
    /**
     * Close SMTP connection
     */
    private function close() {
        if ($this->connection) {
            fclose($this->connection);
            $this->connection = null;
        }
    }
    
    /**
     * Log messages
     */
    private function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";
        @file_put_contents($this->logFile, $logMessage, FILE_APPEND);
        error_log("SMTP: $message");
    }
}

