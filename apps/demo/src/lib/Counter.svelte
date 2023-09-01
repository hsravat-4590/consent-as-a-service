<script lang="ts">
  let count: number = 0
  let token: string = "Token"
  const increment = () => {
    count += 1
  }
</script>

<input bind:value={token}>

<p>Token is {token}</p>