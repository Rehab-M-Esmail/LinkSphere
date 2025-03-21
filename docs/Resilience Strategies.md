# Resilience Strategies

## 1. Circuit Breakers

### Explanation

The design pattern of circuit breakers detects system failures by interrupting additional requests to prevent distributed system failures from accelerating. The circuit breaker activates and blocks additional requests towards the problematic service for an established duration after repeated service failures occur. This feature enables the system to minimize failed requests directed at the escaping service.

### Implementation

- **Monitoring**: The system needs to track external service requests through continuous monitoring of their failure rates.
- **Thresholds**: Define thresholds for failures (e.g., 50% failure rate over 10 seconds).
- **Trip Mechanism**: The circuit breaker triggers because of threshold violation to stop all requests sent to the failing service.
- **Recovery**: The circuit breaker initiates recovery through a specific waiting period before it permits limited service investigation attempts to determine whether the service has restored functionality.

### Justification

- **Prevents Cascading Failures**: The circuit breaker design stops sending requests to failing services, which blocks errors from spreading to different system components.
- **Improves System Stability**: The circuit breaker enables failed services to have recovery time, which decreases the possibility of extended system downtime.
- **Reduces Latency**: The system performance benefits from a lowered latency since requests to failing services automatically fail without waiting for time-outs.

---

## 2. Retries

### Explanation

The process of automated attempted operation execution serves as a key mechanism that lets users handle momentary service failure events. Network glitches together with temporary service unavailability benefit from this method, which proves essential for these kinds of short-lived problems.

### Implementation

- **Exponential Backoff**: The implementation of exponential backoff with retries will prevent overloading a failing service. The first retry will happen after one second, while the second retry follows in two seconds, and the third retry occurs after four seconds, and the pattern continues.
- **Max Retries**: A system parameter regulates the highest number of allowed retries to block endless repetitive actions.
- **Retry Conditions**: The retry system should execute only if the system detects network timeouts or HTTP 5xx errors.

### Justification

- **Handles Transient Failures**: The usage of retries proves successful when addressing pass-through problems that fix themselves in small durations.
- **Improves Success Rates**: The system enhances success ratios by attempting multiple times to complete requests that fail automatically without requiring user involvement.
- **Configurable**: Max retries work with exponential backoff protocols, which protect the system from negative consequences of auto retries.

---

## 3. Fallbacks

### Explanation

A system mechanism known as fallbacks enables secondary response or behavior retrieval during primary service or operation breakdowns. Such measures enable systems to continue basic operations despite dependency unavailability.

### Implementation

- **Default Responses**: In case of primary service failure, users get default responses from the cached database.
- **Alternative Services**: A backup service will activate automatically when the primary service becomes out of reach.
- **Graceful Degradation**: Simplified versions of services and reduced features become accessible to users in case dependencies do not function properly.

### Justification

- **Ensures Continuity**: The system maintains operational continuity through alternative mechanisms, which function in case critical dependencies stop working.
- **Improves User Experience**: A functional version of degraded service maintains user experience without the complete breakdown of the system.
- **Reduces Downtime**: The system downtime is reduced because fallbacks prevent service interruptions.
