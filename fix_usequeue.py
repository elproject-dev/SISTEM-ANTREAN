import re

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'r') as f:
    content = f.read()

addOfflineTarget = """  const addOfflineTicket = useCallback((
    serviceCode: ServiceCode,
    customNumber?: number,
    ticketType: QueueType = 'offline'
  ): QueueTicket => {
    let ticket!: QueueTicket;
    setState((prev) => {
      const currentCounter = prev.counters[serviceCode] || 0;
      const num = customNumber ?? (currentCounter + 1);
      const maxNum = Math.max(currentCounter, num);
      ticket = {
        id: generateId(),
        number: num,
        displayNumber: formatDisplayNumber(serviceCode, num),
        serviceCode,
        type: ticketType,
        status: 'waiting',
        takenAt: Date.now(),
      };
      return {
        ...prev,
        tickets: [...prev.tickets, ticket],
        counters: { ...prev.counters, [serviceCode]: maxNum } as QueueCounters,
      };
    });
    return ticket;
  }, [setState]);"""

addOfflineReplacement = """  const addOfflineTicket = useCallback((
    serviceCode: ServiceCode,
    customNumber?: number,
    ticketType: QueueType = 'offline'
  ): QueueTicket => {
    const currentCounter = state.counters[serviceCode] || 0;
    const num = customNumber ?? (currentCounter + 1);
    const ticket: QueueTicket = {
      id: generateId(),
      number: num,
      displayNumber: formatDisplayNumber(serviceCode, num),
      serviceCode,
      type: ticketType,
      status: 'waiting',
      takenAt: Date.now(),
    };

    setState((prev) => {
      const prevCounter = prev.counters[serviceCode] || 0;
      const actualNum = customNumber ?? (prevCounter + 1);
      const maxNum = Math.max(prevCounter, actualNum);
      const realTicket = {
        ...ticket,
        number: actualNum,
        displayNumber: formatDisplayNumber(serviceCode, actualNum)
      };
      return {
        ...prev,
        tickets: [...prev.tickets, realTicket],
        counters: { ...prev.counters, [serviceCode]: maxNum } as QueueCounters,
      };
    });
    return ticket;
  }, [state.counters, setState]);"""

registerOnlineTarget = """  const registerOnlineTicket = useCallback((
    serviceCode: ServiceCode,
    customerName: string,
    customerPhone: string,
    purpose: string
  ): QueueTicket => {
    let ticket!: QueueTicket;
    setState((prev) => {
      const currentCounter = prev.counters[serviceCode] || 0;
      const num = currentCounter + 1;
      ticket = {
        id: generateId(),
        number: num,
        displayNumber: formatDisplayNumber(serviceCode, num),
        serviceCode,
        type: 'online',
        status: 'pending_checkin',
        customerName,
        customerPhone,
        purpose,
        bookingCode: generateBookingCode(),
        takenAt: Date.now(),
      };
      return {
        ...prev,
        tickets: [...prev.tickets, ticket],
        counters: { ...prev.counters, [serviceCode]: Math.max(currentCounter, num) } as QueueCounters,
      };
    });
    return ticket;
  }, [setState]);"""

registerOnlineReplacement = """  const registerOnlineTicket = useCallback((
    serviceCode: ServiceCode,
    customerName: string,
    customerPhone: string,
    purpose: string
  ): QueueTicket => {
    const currentCounter = state.counters[serviceCode] || 0;
    const num = currentCounter + 1;
    const ticket: QueueTicket = {
      id: generateId(),
      number: num,
      displayNumber: formatDisplayNumber(serviceCode, num),
      serviceCode,
      type: 'online',
      status: 'pending_checkin',
      customerName,
      customerPhone,
      purpose,
      bookingCode: generateBookingCode(),
      takenAt: Date.now(),
    };

    setState((prev) => {
      const prevCounter = prev.counters[serviceCode] || 0;
      const actualNum = prevCounter + 1;
      const realTicket = {
        ...ticket,
        number: actualNum,
        displayNumber: formatDisplayNumber(serviceCode, actualNum)
      };
      return {
        ...prev,
        tickets: [...prev.tickets, realTicket],
        counters: { ...prev.counters, [serviceCode]: Math.max(prevCounter, actualNum) } as QueueCounters,
      };
    });
    return ticket;
  }, [state.counters, setState]);"""

content = content.replace(addOfflineTarget, addOfflineReplacement)
content = content.replace(registerOnlineTarget, registerOnlineReplacement)

with open('apps/sistem-antrean/src/hooks/useQueue.ts', 'w') as f:
    f.write(content)

print("Success fix async state bug")
